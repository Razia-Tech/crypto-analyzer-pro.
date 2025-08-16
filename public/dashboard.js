// Pastikan kamu sudah include Chart.js + chartjs-chart-financial di dashboard.html
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial"></script>

let chart; // global reference ke chart biar bisa destroy kalau ganti source

// Ambil data dari Binance Worker Proxy
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 100) {
  try {
    const url = `https://binance-proxy.kaiosiddik.workers.dev/?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Binance via proxy gagal");

    const raw = await res.json();

    // Binance format: [openTime, open, high, low, close, volume, ...]
    return raw.map(c => ({
      x: new Date(c[0]),
      o: parseFloat(c[1]),
      h: parseFloat(c[2]),
      l: parseFloat(c[3]),
      c: parseFloat(c[4])
    }));
  } catch (err) {
    console.error("Binance error:", err.message);
    return [];
  }
}

// Ambil data dari Coingecko
async function loadCoingeckoCandles(symbol = "bitcoin", vs = "usd", days = 30) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=${vs}&days=${days}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Coingecko gagal");

    const raw = await res.json();

    // Coingecko format: [timestamp, open, high, low, close]
    return raw.map(c => ({
      x: new Date(c[0]),
      o: parseFloat(c[1]),
      h: parseFloat(c[2]),
      l: parseFloat(c[3]),
      c: parseFloat(c[4])
    }));
  } catch (err) {
    console.error("Coingecko error:", err.message);
    return [];
  }
}

// Render chart ke canvas
function renderChart(data, label = "Candlestick Chart") {
  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy(); // biar chart lama dihapus

  chart = new Chart(ctx, {
    type: "candlestick",
    data: {
      datasets: [
        {
          label,
          data,
          borderColor: "rgba(0, 200, 83, 1)",
          color: {
            up: "rgba(0, 200, 83, 1)",
            down: "rgba(244, 67, 54, 1)",
            unchanged: "rgba(128, 128, 128, 1)"
          }
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            source: "auto"
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Fungsi untuk load chart sesuai pilihan user
async function showChart(source = "binance") {
  let data = [];

  if (source === "binance") {
    data = await loadBinanceCandles();
    if (data.length === 0) {
      alert("Binance gagal, coba pakai Coingecko");
      data = await loadCoingeckoCandles();
      renderChart(data, "Coingecko (fallback)");
      return;
    }
    renderChart(data, "Binance");
  } else {
    data = await loadCoingeckoCandles();
    renderChart(data, "Coingecko");
  }
}

// Event Listener tombol
document.getElementById("btnBinance").addEventListener("click", () => showChart("binance"));
document.getElementById("btnCoingecko").addEventListener("click", () => showChart("coingecko"));

// Load awal pakai Binance
showChart("binance");



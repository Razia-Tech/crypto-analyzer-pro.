// === Konfigurasi API Proxy ===
const BINANCE_API = "/api/binance-proxy";
const COINGECKO_API = "/api/coingecko-proxy";

// === Global State ===
const AppState = {
  currentSymbol: "BTCUSDT",
  currentCoinId: "bitcoin",
  currentInterval: "1h",
};

// === Utility: Show/Hide Section ===
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// === 1. Market Fundamentals ===
async function loadFundamentals() {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent(
      "https://api.coingecko.com/api/v3/global"
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const dom = document.getElementById("fundamentalsData");
    dom.innerHTML = `
      <p><b>Active Cryptos:</b> ${data.data.active_cryptocurrencies}</p>
      <p><b>Markets:</b> ${data.data.markets}</p>
      <p><b>Total Market Cap (USD):</b> $${data.data.total_market_cap.usd.toLocaleString()}</p>
      <p><b>Total Volume (USD):</b> $${data.data.total_volume.usd.toLocaleString()}</p>
    `;
  } catch (err) {
    console.error("Fundamentals error", err);
  }
}

// === 2. Trending Coins ===
async function loadTrending() {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent(
      "https://api.coingecko.com/api/v3/search/trending"
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const dom = document.getElementById("trendingList");
    dom.innerHTML = data.coins
      .map(c => `<p>${c.item.name} (${c.item.symbol}) Rank: ${c.item.market_cap_rank}</p>`)
      .join("");
  } catch (err) {
    console.error("Trending error", err);
  }
}

// === 3. Top 25 Coins ===
async function loadTop25() {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1"
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const dom = document.getElementById("top25Table");
    dom.innerHTML = data
      .map(
        (c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c.name} (${c.symbol.toUpperCase()})</td>
        <td>$${c.current_price.toLocaleString()}</td>
        <td style="color:${c.price_change_percentage_24h >= 0 ? "lime" : "red"}">
          ${c.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${c.market_cap.toLocaleString()}</td>
        <td>$${c.total_volume.toLocaleString()}</td>
      </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Top25 error", err);
  }
}

// === 4. Binance Candlesticks ===
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 50) {
  try {
    const url = `${BINANCE_API}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    console.log("Binance Candles:", data);

    const container = document.getElementById("binanceCandleContainer");
    container.innerHTML = "";
    const chart = LightweightCharts.createChart(container, { height: 400 });
    const series = chart.addCandlestickSeries();

    const formatted = data.map(c => ({
      time: Math.floor(c[0] / 1000),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
    }));
    series.setData(formatted);
  } catch (err) {
    console.error("Binance fetch error:", err);
  }
}

// === 5. CoinGecko OHLC Chart ===
async function loadCoinGeckoCandlesInto(containerId, coinId = "bitcoin") {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    console.log("CoinGecko chart:", data);

    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const chart = LightweightCharts.createChart(container, { height: 400 });
    const series = chart.addLineSeries();

    const formatted = data.prices.map(p => ({
      time: Math.floor(p[0] / 1000),
      value: p[1],
    }));
    series.setData(formatted);
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}

// === 6. Search Chart ===
async function handleSearch(e) {
  if (e.key === "Enter") {
    const val = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!val) return;
    loadCoinGeckoCandlesInto("searchChartContainer", val);
  }
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  loadFundamentals();
  loadTrending();
  loadTop25();
  loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval);
  loadCoinGeckoCandlesInto("coingeckoChartContainer", AppState.currentCoinId);

  // Events
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("keypress", handleSearch);

  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", () => {
    loadFundamentals();
    loadTrending();
    loadTop25();
  });
});

// ==================== CONFIG ====================
const BINANCE_API = "/api/binance-proxy";
const COINGECKO_API = "/api/coingecko-proxy";

// State
const AppState = {
  currentSymbol: "BTCUSDT",
  currentCoinId: "bitcoin",
  currentInterval: "1h",
};

// ==================== UI NAVIGATION ====================
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ==================== FUNDAMENTALS ====================
async function loadFundamentals() {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent("https://api.coingecko.com/api/v3/global")}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById("fundamentalsData").innerText = JSON.stringify(data.data, null, 2);
  } catch (err) {
    console.error("Fundamentals error", err);
  }
}

// ==================== TOP 25 COINS ====================
async function loadTop25() {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1"
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const tbody = document.getElementById("top25Table");
    tbody.innerHTML = "";
    data.forEach((coin, i) => {
      const row = `<tr>
        <td>${i + 1}</td>
        <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td style="color:${coin.price_change_percentage_24h >= 0 ? "lime" : "red"}">
          ${coin.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td>$${coin.total_volume.toLocaleString()}</td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Top25 error", err);
  }
}

// ==================== BINANCE CANDLES ====================
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h") {
  try {
    const url = `${BINANCE_API}?symbol=${symbol}&interval=${interval}&limit=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const container = document.getElementById("binanceCandleContainer");
    container.innerHTML = "";

    const chart = LightweightCharts.createChart(container, { height: 400 });
    const candleSeries = chart.addCandlestickSeries();

    const formatted = data.map(d => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    candleSeries.setData(formatted);
  } catch (err) {
    console.error("Binance fetch error:", err);
  }
}

// ==================== COINGECKO CHART ====================
async function loadCoinGeckoCandlesInto(containerId, coinId = "bitcoin") {
  try {
    const url = `${COINGECKO_API}?url=${encodeURIComponent(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const chart = LightweightCharts.createChart(container, { height: 400 });
    const series = chart.addAreaSeries({
      lineColor: "blue",
      topColor: "rgba(0,0,255,0.4)",
      bottomColor: "rgba(0,0,255,0.0)"
    });

    const formatted = data.prices.map(p => ({
      time: Math.floor(p[0] / 1000),
      value: p[1],
    }));
    series.setData(formatted);
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}

// ==================== COMPARISON ====================
function updateComparison() {
  const val = document.getElementById("coinSelector").value;
  const interval = document.getElementById("intervalSelector").value;
  const [binanceSymbol, cgId] = val.split("|");

  AppState.currentSymbol = binanceSymbol;
  AppState.currentCoinId = cgId;
  AppState.currentInterval = interval;

  loadBinanceCandles(binanceSymbol, interval);
  loadCoinGeckoCandlesInto("coingeckoChartContainer", cgId);
}

// ==================== EVENT LISTENERS ====================
document.addEventListener("DOMContentLoaded", () => {
  // Load fundamentals default
  loadFundamentals();

  // Load Top 25 hanya saat tab diklik
  document.querySelector("li[onclick=\"showSection('top25')\"]")
    .addEventListener("click", loadTop25);

  // Load Binance chart hanya saat tab diklik
  document.querySelector("li[onclick=\"showSection('binanceChart')\"]")
    .addEventListener("click", () => loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval));

  // Load Comparison hanya saat tab diklik
  document.querySelector("li[onclick=\"showSection('charts')\"]")
    .addEventListener("click", updateComparison);
});


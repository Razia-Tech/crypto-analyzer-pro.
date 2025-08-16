// =====================
// Global State
// =====================
const AppState = {
  currentSymbol: "BTCUSDT",
  currentInterval: "1h",
  currentCoinId: "bitcoin",
  charts: {},
};

// =====================
// Helpers
// =====================
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function formatNumber(num) {
  if (!num) return "-";
  return Number(num).toLocaleString();
}

// =====================
// Fundamentals
// =====================
async function loadFundamentals() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global");
    const data = await res.json();
    const d = data.data;

    document.getElementById("fundamentalsData").innerHTML = `
      <p>Active Cryptos: ${d.active_cryptocurrencies}</p>
      <p>Markets: ${d.markets}</p>
      <p>BTC Dominance: ${d.market_cap_percentage.btc.toFixed(2)}%</p>
      <p>Total Market Cap: $${formatNumber(d.total_market_cap.usd)}</p>
    `;
  } catch (err) {
    console.error("Fundamentals error", err);
  }
}

// =====================
// Trending
// =====================
async function loadTrending() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
    const data = await res.json();
    document.getElementById("trendingList").innerHTML = data.coins.map(c =>
      `<div>${c.item.name} (${c.item.symbol}) Rank: ${c.item.market_cap_rank}</div>`
    ).join("");
  } catch (err) {
    console.error("Trending error", err);
  }
}

// =====================
// Top 25
// =====================
async function loadTop25() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false");
    const data = await res.json();

    document.getElementById("top25Table").innerHTML = data.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c.name} (${c.symbol.toUpperCase()})</td>
        <td>$${formatNumber(c.current_price)}</td>
        <td style="color:${c.price_change_percentage_24h >= 0 ? 'green':'red'}">
          ${c.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${formatNumber(c.market_cap)}</td>
        <td>$${formatNumber(c.total_volume)}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Top25 error", err);
  }
}

// =====================
// TradingView Widget
// =====================
function loadTradingView(symbol = "BTCUSDT") {
  document.getElementById("tradingview").innerHTML = "";
  new TradingView.widget({
    container_id: "tradingview",
    autosize: true,
    symbol: "BINANCE:" + symbol,
    interval: "60",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    allow_symbol_change: true,
    hide_side_toolbar: false
  });
}

// =====================
// Binance Candlesticks
// =====================
// Worker proxy kamu
const BINANCE_PROXY = "https://binance-proxy.kaiosiddik.workers.dev";

// Fungsi ambil candlestick Binance
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 100) {
  try {
    const url = `${BINANCE_PROXY}/?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Convert ke format chart
    const candles = data.map(d => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    renderBinanceChart(candles);
  } catch (err) {
    console.error("Binance fetch error:", err);
  }
}


// =====================
// CoinGecko 30D Chart
// =====================
async function loadCoinGeckoCandlesInto(containerId, coinId = "bitcoin") {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`;
    const res = await fetch(url);
    const data = await res.json();

    const prices = data.prices.map(p => ({
      time: Math.floor(p[0] / 1000),
      value: p[1]
    }));

    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: { background: { color: "#111" }, textColor: "#DDD" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } }
    });

    const lineSeries = chart.addLineSeries({ color: "#2962FF" });
    lineSeries.setData(prices);
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}

// =====================
// Search Chart
// =====================
async function handleSearch(e) {
  if (e.key === "Enter") {
    const q = document.getElementById("searchInput").value.toLowerCase().trim();
    if (!q) return;

    loadCoinGeckoCandlesInto("searchChartContainer", q);
    showSection("searchChart");
  }
}

// =====================
// Init
// =====================
window.addEventListener("DOMContentLoaded", () => {
  loadFundamentals();
  loadTrending();
  loadTop25();
  loadTradingView(AppState.currentSymbol);
  loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval);

  // Events
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("keydown", handleSearch);

  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", () => {
    loadFundamentals();
    loadTrending();
    loadTop25();
    loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval);
    loadCoinGeckoCandlesInto("coingeckoChartContainer", AppState.currentCoinId);
  });
});

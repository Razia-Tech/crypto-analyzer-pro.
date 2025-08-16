// =======================
// CONFIG
// =======================
const BINANCE_PROXY = "https://binance-proxy.DOMAIN.workers.dev";
const COINGECKO_PROXY = "https://coingecko-proxy.DOMAIN.workers.dev";

// State global
const AppState = {
  currentSymbol: "BTCUSDT",
  currentCoinId: "bitcoin",
  currentInterval: "1h",
};

// =======================
// COINGECKO FUNDAMENTALS
// =======================
async function loadFundamentals() {
  try {
    const url = `${COINGECKO_PROXY}/?url=https://api.coingecko.com/api/v3/global`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById("fundamentalsData").innerHTML = `
      Active Cryptos: ${data.data.active_cryptocurrencies}<br>
      Markets: ${data.data.markets}<br>
      BTC Dominance: ${data.data.market_cap_percentage.btc.toFixed(2)}%<br>
      ETH Dominance: ${data.data.market_cap_percentage.eth.toFixed(2)}%
    `;
  } catch (err) {
    console.error("Fundamentals error", err);
  }
}

// =======================
// COINGECKO TRENDING 12
// =======================
async function loadTrending() {
  try {
    const url = `${COINGECKO_PROXY}/?url=https://api.coingecko.com/api/v3/search/trending`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = data.coins
      .map(
        (c) =>
          `<div>${c.item.name} (${c.item.symbol}) Rank: ${c.item.market_cap_rank}</div>`
      )
      .join("");
    document.getElementById("trendingList").innerHTML = list;
  } catch (err) {
    console.error("Trending error", err);
  }
}

// =======================
// COINGECKO TOP 25
// =======================
async function loadTop25() {
  try {
    const url = `${COINGECKO_PROXY}/?url=https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rows = data
      .map(
        (c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c.name} (${c.symbol.toUpperCase()})</td>
        <td>$${c.current_price}</td>
        <td style="color:${c.price_change_percentage_24h >= 0 ? "lime" : "red"}">
          ${c.price_change_percentage_24h?.toFixed(2)}%
        </td>
        <td>$${c.market_cap.toLocaleString()}</td>
        <td>$${c.total_volume.toLocaleString()}</td>
      </tr>`
      )
      .join("");
    document.getElementById("top25Table").innerHTML = rows;
  } catch (err) {
    console.error("Top25 error", err);
  }
}

// =======================
// BINANCE CANDLESTICKS
// =======================
async function loadBinanceCandles(symbol, interval, limit = 50) {
  try {
    const url = `${BINANCE_PROXY}/?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const candles = data.map((d) => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    const container = document.getElementById("binanceCandleContainer");
    container.innerHTML = "";
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 420,
    });
    const series = chart.addCandlestickSeries();
    series.setData(candles);
  } catch (err) {
    console.error("Binance fetch error:", err);
  }
}

// =======================
// COINGECKO CHART (30D)
// =======================
async function loadCoinGeckoCandlesInto(containerId, coinId) {
  try {
    const url = `${COINGECKO_PROXY}/?url=https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const candles = data.prices.map((p) => ({
      time: p[0] / 1000,
      value: p[1],
    }));

    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 420,
    });
    const line = chart.addLineSeries();
    line.setData(candles);
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}

// =======================
// SEARCH (COINGECKO)
// =======================
async function searchCoinChart(coinId) {
  loadCoinGeckoCandlesInto("searchChartContainer", coinId);
}

// =======================
// NAVIGATION
// =======================
function showSection(id) {
  document.querySelectorAll(".section").forEach((s) => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  // Load defaults
  loadFundamentals();
  loadTrending();
  loadTop25();
  loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval);
  loadCoinGeckoCandlesInto("coingeckoChartContainer", AppState.currentCoinId);

  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim().toLowerCase();
        if (query) searchCoinChart(query);
      }
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadFundamentals();
      loadTrending();
      loadTop25();
      loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval);
    });
  }
});

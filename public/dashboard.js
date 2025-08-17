/* ==========================
   DASHBOARD.JS FINAL
   ========================== */

// State
const AppState = {
  currentSymbol: "BTCUSDT",
  currentCoinId: "bitcoin",
  currentInterval: "1h",
};

// ----------------------------
// UTILS
// ----------------------------
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatNumber(num) {
  if (!num) return "--";
  return Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
}

// ----------------------------
// NAVIGATION
// ----------------------------
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ----------------------------
// FUNDAMENTALS
// ----------------------------
async function loadFundamentals() {
  try {
    const data = await fetchJSON("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/global");

    document.getElementById("btcDominance").textContent =
      data.data.market_cap_percentage.btc.toFixed(1) + "%";
    document.getElementById("marketCap").textContent =
      "$" + formatNumber(data.data.total_market_cap.usd);
    document.getElementById("volume24h").textContent =
      "$" + formatNumber(data.data.total_volume.usd);
    document.getElementById("fearGreed").textContent = "😐 Neutral"; // placeholder
    document.getElementById("devScore").textContent = "N/A"; // placeholder
    document.getElementById("supplyData").textContent = "N/A"; // placeholder
  } catch (e) {
    console.error("Fundamentals error", e);
  }
}

// ----------------------------
// TRENDING 12
// ----------------------------
async function loadTrending() {
  try {
    const data = await fetchJSON("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/search/trending");
    const tbody = document.querySelector("#trendingTable tbody");
    tbody.innerHTML = "";

    data.coins.slice(0, 12).forEach(c => {
      const coin = c.item;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${coin.small}" width="20"/></td>
        <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.data?.price || "--"}</td>
        <td>${coin.market_cap_rank || "--"}</td>
        <td>${coin.data?.total_volume || "--"}</td>
        <td><span class="badge">Hold</span></td>
        <td><button onclick="viewChart('${coin.id}')">View</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (e) {
    console.error("Trending error", e);
  }
}

// ----------------------------
// TOP 25
// ----------------------------
async function loadTop25() {
  try {
    const url = "/api/coingecko-proxy?url=" +
      encodeURIComponent("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1");

    const data = await fetchJSON(url);
    const tbody = document.querySelector("#topCoinsTable tbody");
    tbody.innerHTML = "";

    data.forEach(coin => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${coin.image}" width="20"/></td>
        <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price}</td>
        <td style="color:${coin.price_change_percentage_24h >= 0 ? 'lime' : 'red'}">
          ${coin.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${formatNumber(coin.market_cap)}</td>
        <td><span class="badge">${coin.price_change_percentage_24h > 0 ? 'Buy' : 'Sell'}</span></td>
        <td><button onclick="viewChart('${coin.id}')">View</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (e) {
    console.error("Top25 error", e);
  }
}

// ----------------------------
// CHARTS
// ----------------------------
async function loadBinanceCandles(symbol, interval) {
  try {
    const url = `/api/binance-proxy?symbol=${symbol}&interval=${interval}&limit=100`;
    const data = await fetchJSON(url);

    const chartEl = document.getElementById("binanceChart");
    chartEl.innerHTML = "";
    const chart = LightweightCharts.createChart(chartEl, { width: chartEl.clientWidth, height: 400 });
    const candleSeries = chart.addCandlestickSeries();

    const candles = data.map(d => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    candleSeries.setData(candles);
  } catch (e) {
    console.error("Binance fetch error:", e);
  }
}

async function loadCoinGeckoCandlesInto(containerId, coinId) {
  try {
    const url = "/api/coingecko-proxy?url=" +
      encodeURIComponent(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`);
    const data = await fetchJSON(url);

    const chartEl = document.getElementById(containerId);
    chartEl.innerHTML = "";
    const chart = LightweightCharts.createChart(chartEl, { width: chartEl.clientWidth, height: 400 });
    const lineSeries = chart.addLineSeries({ color: 'gold' });

    const prices = data.prices.map(d => ({ time: Math.floor(d[0] / 1000), value: d[1] }));
    lineSeries.setData(prices);

    console.log("CoinGecko chart:", data);
  } catch (e) {
    console.error("CoinGecko chart error", e);
  }
}

function updateComparison() {
  const val = document.getElementById("coinSelector").value;
  const interval = document.getElementById("intervalSelector").value;
  const [binanceSymbol, cgId] = val.split("|");

  AppState.currentSymbol = binanceSymbol;
  AppState.currentCoinId = cgId;
  AppState.currentInterval = interval;

  loadBinanceCandles(binanceSymbol, interval);
  loadCoinGeckoCandlesInto("coingeckoChart", cgId);
}

function viewChart(coinId) {
  showSection("comparison");
  AppState.currentCoinId = coinId;
  loadCoinGeckoCandlesInto("coingeckoChart", coinId);
}

// ----------------------------
// NEWS
// ----------------------------
async function loadNews() {
  try {
    const url = "/api/coingecko-proxy?url=" +
      encodeURIComponent("https://api.coingecko.com/api/v3/news?category=general");
    const data = await fetchJSON(url);

    const container = document.getElementById("newsContainer");
    container.innerHTML = "";

    if (!data || !data.data) {
      container.innerHTML = "<p>No news available</p>";
      return;
    }

    data.data.slice(0, 10).forEach(n => {
      const div = document.createElement("div");
      div.className = "news-item";
      div.innerHTML = `
        <h4><a href="${n.url}" target="_blank">${n.title}</a></h4>
        <p>${n.source} - ${new Date(n.published_at).toLocaleDateString()}</p>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error("News error", e);
  }
}

// ----------------------------
// INIT
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadFundamentals();
  loadTrending();
  loadTop25();
  updateComparison();
  loadNews();
});




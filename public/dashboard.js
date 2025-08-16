// dashboard.js

// Toggle section
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "fundamentals") loadFundamentals();
  if (id === "trending") loadTrending();
  if (id === "top25") loadTop25();
  if (id === "tvchart") loadTradingView();
  if (id === "charts") showChart("binance"); // default binance
}

// ========== Market Fundamentals (Bitcoin) ==========
async function loadFundamentals() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin");
    const data = await res.json();
    document.getElementById("fundamentalsData").innerHTML = `
      <p><b>${data.name} (${data.symbol.toUpperCase()})</b></p>
      <p>Price: $${data.market_data.current_price.usd.toLocaleString()}</p>
      <p>Market Cap: $${data.market_data.market_cap.usd.toLocaleString()}</p>
      <p>Volume 24h: $${data.market_data.total_volume.usd.toLocaleString()}</p>
      <p>Community Score: ${data.community_score}</p>
      <p>Developer Score: ${data.developer_score}</p>
    `;
  } catch (err) {
    document.getElementById("fundamentalsData").innerHTML =
      `<p style="color:red">Error load data: ${err.message}</p>`;
  }
}

// ========== Trending Coins ==========
async function loadTrending() {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  const data = await res.json();
  const list = document.getElementById("trendingList");
  list.innerHTML = "";
  data.coins.forEach((c, i) => {
    list.innerHTML += `
      <div class="trending-coin">
        <span>${i + 1}. <img src="${c.item.thumb}" width="16"/> ${c.item.name} (${c.item.symbol})</span>
        <span class="badge">Rank: ${c.item.market_cap_rank}</span>
      </div>`;
  });
}

// ========== Top 25 Coins ==========
async function loadTop25() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false");
  const data = await res.json();
  const tbody = document.getElementById("top25Table");
  tbody.innerHTML = "";
  data.forEach((coin, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td><img src="${coin.image}" width="16"/> ${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td class="${coin.price_change_percentage_24h >= 0 ? 'up':'down'}">
          ${coin.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td>$${coin.total_volume.toLocaleString()}</td>
      </tr>`;
  });
}

// ========== TradingView Chart ==========
function loadTradingView() {
  if (window.tvWidget) return;
  window.tvWidget = new TradingView.widget({
    container_id: "tradingview",
    autosize: true,
    symbol: "BINANCE:BTCUSDT",
    interval: "60",
    theme: "dark",
    style: "1",
    locale: "en"
  });
}

// ========== Chart Comparison (Binance vs CoinGecko) ==========
function showChart(type) {
  document.getElementById("binanceChartContainer").classList.add("hidden");
  document.getElementById("coingeckoChartContainer").classList.add("hidden");

  if (type === "binance") {
    document.getElementById("binanceChartContainer").classList.remove("hidden");
    loadBinanceCandles();
  } else {
    document.getElementById("coingeckoChartContainer").classList.remove("hidden");
    loadCoinGeckoCandles();
  }
}

// Binance Candlestick (proxy + fallback)
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 100) {
  const res = await fetch(`/.netlify/functions/binance?symbol=BTCUSDT&interval=1h&limit=100`);
  container.innerHTML = "<p style='color:gray'>Loading Binance data...</p>";

  try {
    // 1. Try Netlify Function
    let res = await fetch(`/.netlify/functions/binance?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error("Netlify proxy failed");
    let data = await res.json();

    renderBinanceChart(container, data);
  } catch (err1) {
    console.warn("Netlify proxy error:", err1.message);
    try {
      // 2. Try Binance mirror
      let res2 = await fetch(`https://api1.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      if (!res2.ok) throw new Error("Mirror API failed");
      let data2 = await res2.json();

      renderBinanceChart(container, data2);
    } catch (err2) {
      console.warn("Mirror API error:", err2.message);
      // 3. Fallback CoinGecko
      container.innerHTML = "<p style='color:red'>Binance chart unavailable, fallback to CoinGecko</p>";
      loadCoinGeckoCandles();
    }
  }
}

function renderBinanceChart(container, data) {
  container.innerHTML = "";
  const chart = LightweightCharts.createChart(container, { width: container.clientWidth, height: 400 });
  const candleSeries = chart.addCandlestickSeries();
  candleSeries.setData(data.map(c => ({
    time: c[0] / 1000,
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4])
  })));
}

// CoinGecko Candlestick (30D)
async function loadBinanceCandles(...) {
  try {
    const res = await fetch(`/.netlify/functions/binance?...`);
    if (!res.ok) throw new Error("Binance blocked");
    const data = await res.json();
    renderBinanceChart(data);
  } catch (e) {
    console.warn("Binance fetch failed:", e.message);
    document.getElementById("binanceChartContainer").innerHTML =
      "<p style='color:red'>Binance chart unavailable, showing CoinGecko instead</p>";
    loadCoinGeckoCandles();
  }
}


// ========== Search Input ==========
document.getElementById("searchInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const val = e.target.value.trim().toLowerCase();
    if (val) {
      showSection("searchChart");
      loadCoinGeckoCandles(val); // gunakan CoinGecko untuk search
    }
  }
});

// ========== Refresh Button ==========
document.getElementById("refreshBtn").addEventListener("click", () => {
  const active = document.querySelector(".section:not(.hidden)");
  if (active) showSection(active.id);
});

// Default load
showSection("fundamentals");


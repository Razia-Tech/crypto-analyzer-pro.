// dashboard.js

// Utility
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  // Load data sesuai section
  if (id === "fundamentals") loadFundamentals();
  if (id === "trending") loadTrending();
  if (id === "top25") loadTop25();
  if (id === "tvchart") loadTradingView();
  if (id === "binanceChart") loadBinanceCandles();
}

// ========== 1. Market Fundamentals (Bitcoin example) ==========
async function loadFundamentals() {
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
}

// ========== 2. Trending Coins ==========
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

// ========== 3. Top 25 Coins ==========
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

// ========== 4. TradingView Chart ==========
function loadTradingView() {
  if (window.tvWidget) return; // biar gak double
  window.tvWidget = new TradingView.widget({
    container_id: "tradingview",
    autosize: true,
    symbol: "BINANCE:BTCUSDT",
    interval: "60",
    theme: "dark",
    style: "1",
    locale: "en",
    hide_top_toolbar: false,
    hide_side_toolbar: false
  });
}

// ========== 5. Binance Candlesticks ==========
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 100) {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  const data = await res.json();

  const container = document.getElementById("binanceCandleContainer");
  container.innerHTML = ""; // reset

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

// ========== 6. Search Chart (30D) ==========
async function loadSearchChart(coin = "bitcoin") {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30`);
  if (!res.ok) {
    alert("Coin tidak ditemukan!");
    return;
  }
  const data = await res.json();

  const container = document.getElementById("searchChartContainer");
  container.innerHTML = "";

  const chart = LightweightCharts.createChart(container, { width: container.clientWidth, height: 400 });
  const lineSeries = chart.addLineSeries();
  lineSeries.setData(data.prices.map(p => ({ time: Math.floor(p[0] / 1000), value: p[1] })));
}

// ========== Search Input ==========
document.getElementById("searchInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const val = e.target.value.trim().toLowerCase();
    if (val) {
      showSection("searchChart");
      loadSearchChart(val);
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


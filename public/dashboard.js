// State
const AppState = {
  currentSymbol: "BTCUSDT",
  currentCoinId: "bitcoin",
  currentInterval: "1h",
};

// Section toggle
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Logout dummy
function logout() {
  alert("Logout success!");
}

// Load Market Fundamentals
async function loadFundamentals() {
  try {
    // Market Global
    const resGlobal = await fetch("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/global");
    const global = await resGlobal.json();

    // Fear & Greed
    const resFG = await fetch("https://api.alternative.me/fng/");
    const fg = await resFG.json();

    // Developer Score & Supply (ambil Bitcoin default)
    const resBTC = await fetch("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/coins/bitcoin");
    const btc = await resBTC.json();

    document.getElementById("fundamentalsData").innerHTML = `
      <div class="card"><h4>Market Cap</h4><p>$${(global.data.total_market_cap.usd/1e9).toFixed(2)}B</p></div>
      <div class="card"><h4>24h Volume</h4><p>$${(global.data.total_volume.usd/1e9).toFixed(2)}B</p></div>
      <div class="card"><h4>BTC Dominance</h4><p>${global.data.market_cap_percentage.btc.toFixed(2)}%</p></div>
      <div class="card"><h4>Fear & Greed Index</h4><p>${fg.data[0].value} (${fg.data[0].value_classification})</p></div>
      <div class="card"><h4>Dev Score (BTC)</h4><p>${btc.developer_score.toFixed(2)}</p></div>
      <div class="card"><h4>Supply</h4>
        <p>Circulating: ${(btc.market_data.circulating_supply/1e6).toFixed(2)}M</p>
        <p>Total: ${(btc.market_data.total_supply/1e6).toFixed(2)}M</p>
      </div>
    `;
  } catch (err) {
    console.error("Fundamentals error", err);
  }
}

// Load Trending
async function loadTrending() {
  try {
    const res = await fetch("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/search/trending");
    const data = await res.json();
    let html = "<tr><th>Logo</th><th>Name</th><th>Symbol</th><th>Rank</th><th>Action</th></tr>";
    data.coins.slice(0,12).forEach(c => {
      html += `<tr>
        <td><img src="${c.item.thumb}" width="20"></td>
        <td>${c.item.name}</td>
        <td>${c.item.symbol}</td>
        <td>${c.item.market_cap_rank}</td>
        <td><button onclick="viewChart('${c.item.id}')">View</button></td>
      </tr>`;
    });
    document.getElementById("trendingTable").innerHTML = html;
  } catch (err) {
    console.error("Trending error", err);
  }
}

// Load Top 25
async function loadTop25() {
  try {
    const res = await fetch("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1");
    const data = await res.json();
    let html = "<tr><th>Logo</th><th>Name</th><th>Price</th><th>24h %</th><th>MCap</th></tr>";
    data.forEach(c => {
      html += `<tr>
        <td><img src="${c.image}" width="20"></td>
        <td>${c.name} (${c.symbol.toUpperCase()})</td>
        <td>$${c.current_price}</td>
        <td>${c.price_change_percentage_24h.toFixed(2)}%</td>
        <td>$${(c.market_cap/1e9).toFixed(2)}B</td>
      </tr>`;
    });
    document.getElementById("top25Table").innerHTML = html;
  } catch (err) {
    console.error("Top25 error", err);
  }
}

// Chart comparison
async function loadBinanceCandles(symbol, interval) {
  try {
    const res = await fetch(`/api/binance-proxy?symbol=${symbol}&interval=${interval}&limit=100`);
    const data = await res.json();
    const chart = LightweightCharts.createChart(document.getElementById("binanceChart"), { width:600, height:300 });
    const series = chart.addCandlestickSeries();
    series.setData(data.map(c => ({
      time: c[0]/1000,
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4])
    })));
  } catch (err) {
    console.error("Binance fetch error", err);
  }
}

async function loadCoinGeckoCandlesInto(id, coinId) {
  try {
    const res = await fetch(`/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=30`);
    const data = await res.json();
    const chart = LightweightCharts.createChart(document.getElementById(id), { width:600, height:300 });
    const series = chart.addCandlestickSeries();
    series.setData(data.map(c => ({
      time: c[0]/1000,
      open: c[1],
      high: c[2],
      low: c[3],
      close: c[4]
    })));
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}

function updateComparison() {
  loadBinanceCandles(AppState.currentSymbol, AppState.currentInterval);
  loadCoinGeckoCandlesInto("coingeckoChart", AppState.currentCoinId);
}

// News
async function loadNews() {
  try {
    const res = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");
    const data = await res.json();
    let html = "";
    data.Data.slice(0,10).forEach(n => {
      html += `<div class="card">
        <h4>${n.title}</h4>
        <p>${n.body.substring(0,120)}...</p>
        <a href="${n.url}" target="_blank">Read more</a>
      </div>`;
    });
    document.getElementById("newsList").innerHTML = html;
  } catch (err) {
    console.error("News error", err);
  }
}

// Auto init
loadFundamentals();
loadTrending();
loadTop25();
loadNews();




// =============================
// STATE
// =============================
const AppState = {
  currentSymbol: "BTCUSDT",
  currentCoinId: "bitcoin",
  currentInterval: "1h"
};

// =============================
// SECTION HANDLER
// =============================
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// =============================
// MARKET FUNDAMENTALS (CoinGecko)
// =============================
async function loadFundamentals(coinId = "bitcoin") {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const res = await fetch(url);
    const data = await res.json();

    const html = `
      <p><b>Name:</b> ${data.name} (${data.symbol.toUpperCase()})</p>
      <p><b>Price:</b> $${data.market_data.current_price.usd.toLocaleString()}</p>
      <p><b>Market Cap:</b> $${data.market_data.market_cap.usd.toLocaleString()}</p>
      <p><b>Volume 24h:</b> $${data.market_data.total_volume.usd.toLocaleString()}</p>
      <p><b>Community Score:</b> ${data.community_score}</p>
      <p><b>Developer Score:</b> ${data.developer_score}</p>
    `;

    document.getElementById("fundamentalsData").innerHTML = html;
  } catch (err) {
    document.getElementById("fundamentalsData").innerHTML = "Failed to load fundamentals.";
    console.error(err);
  }
}

// =============================
// TRENDING (CoinGecko)
// =============================
async function loadTrending() {
  try {
    const url = "https://api.coingecko.com/api/v3/search/trending";
    const res = await fetch(url);
    const data = await res.json();

    let html = "<ul>";
    data.coins.slice(0, 12).forEach(c => {
      html += `<li>${c.item.name} (${c.item.symbol}) - Rank: ${c.item.market_cap_rank}</li>`;
    });
    html += "</ul>";

    document.getElementById("trendingList").innerHTML = html;
  } catch (err) {
    document.getElementById("trendingList").innerHTML = "Failed to load trending.";
    console.error(err);
  }
}

// =============================
// TOP 25 (CoinGecko)
// =============================
async function loadTop25() {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false";
    const res = await fetch(url);
    const data = await res.json();

    let rows = "";
    data.forEach((coin, i) => {
      rows += `
        <tr>
          <td>${i + 1}</td>
          <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
          <td>$${coin.current_price.toLocaleString()}</td>
          <td style="color:${coin.price_change_percentage_24h >= 0 ? 'lime' : 'red'}">
            ${coin.price_change_percentage_24h.toFixed(2)}%
          </td>
          <td>$${coin.market_cap.toLocaleString()}</td>
          <td>$${coin.total_volume.toLocaleString()}</td>
        </tr>
      `;
    });

    document.getElementById("top25Table").innerHTML = rows;
  } catch (err) {
    document.getElementById("top25Table").innerHTML = "<tr><td colspan='6'>Failed to load</td></tr>";
    console.error(err);
  }
}

// =============================
// TRADINGVIEW WIDGET
// =============================
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
    hide_side_toolbar: false,
    allow_symbol_change: true
  });
}

// =============================
// BINANCE CANDLESTICKS via Proxy
// =============================
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", containerId = "binanceCandleContainer") {
  try {
    const url = `https://binance-proxy.kaiosiddik.workers.dev/?symbol=${symbol}&interval=${interval}&limit=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Binance Proxy failed");
    const raw = await res.json();

    const data = raw.map(c => ({
      time: c[0] / 1000,
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4])
    }));

    // render lightweight-charts
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // reset
    const chart = LightweightCharts.createChart(container, { width: container.clientWidth, height: 420 });
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(data);
  } catch (err) {
    console.error("Binance error:", err);
    document.getElementById(containerId).innerHTML = "Failed to load Binance chart.";
  }
}

// =============================
// COINGECKO CANDLESTICKS
// =============================
async function loadCoinGeckoCandlesInto(containerId, coinId = "bitcoin", days = 30) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("CoinGecko failed");
    const raw = await res.json();

    const data = raw.map(c => ({
      time: c[0] / 1000,
      open: c[1],
      high: c[2],
      low: c[3],
      close: c[4]
    }));

    const container = document.getElementById(containerId);
    container.innerHTML = ""; // reset
    const chart = LightweightCharts.createChart(container, { width: container.clientWidth, height: 420 });
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(data);
  } catch (err) {
    console.error("CoinGecko error:", err);
    document.getElementById(containerId).innerHTML = "Failed to load Coingecko chart.";
  }
}

// =============================
// SEARCH CHART (CoinGecko, 30D)
// =============================
async function loadSearchChart(coinId = "bitcoin") {
  await loadCoinGeckoCandlesInto("searchChartContainer", coinId, 30);
}

// =============================
// REFRESH BTN
// =============================
document.getElementById("refreshBtn").addEventListener("click", () => {
  loadFundamentals(AppState.currentCoinId);
  loadTrending();
  loadTop25();
});

// =============================
// SEARCH INPUT (Enter untuk cari)
// =============================
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const val = e.target.value.trim().toLowerCase();
    if (val) {
      AppState.currentCoinId = val;
      loadFundamentals(val);
      loadSearchChart(val);
      showSection("searchChart");
    }
  }
});

// =============================
// INIT PAGE
// =============================
window.addEventListener("load", () => {
  loadFundamentals("bitcoin");
  loadTrending();
  loadTop25();
  loadTradingView("BTCUSDT");
  loadBinanceCandles("BTCUSDT", "1h");
  loadSearchChart("bitcoin");
});




// =======================
// Dashboard.js (FINAL)
// =======================

// Load Market Fundamentals (CoinGecko Global Data)
async function loadFundamentals() {
  try {
    const res = await fetch("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/global");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById("fundamentals").innerText = JSON.stringify(data.data, null, 2);
  } catch (err) {
    console.error("Fundamentals error", err);
  }
}

// Load Trending Coins (CoinGecko)
async function loadTrending() {
  try {
    const res = await fetch("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/search/trending");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById("trending").innerText = JSON.stringify(data.coins, null, 2);
  } catch (err) {
    console.error("Trending error", err);
  }
}

// Load Top 25 Coins by Market Cap (CoinGecko)
async function loadTop25() {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1";
    const res = await fetch(`/api/coingecko-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById("top25").innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("Top25 error", err);
  }
}

// =======================
// Binance / CoinGecko Candlesticks
// =======================
async function loadBinanceCandles(symbol = "BTCUSDT", interval = "1h", limit = 100) {
  try {
    const res = await fetch(`/api/binance-proxy?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    // Normalize candles
    const candles = raw.map(item => {
      if (item.length > 5) {
        // Binance format
        return {
          time: item[0] / 1000,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        };
      } else {
        // CoinGecko format
        return {
          time: item[0] / 1000,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        };
      }
    });

    // Render chart
    const chartContainer = document.getElementById("binanceChart");
    chartContainer.innerHTML = ""; // clear old chart
    const chart = LightweightCharts.createChart(chartContainer, {
      width: 800,
      height: 400,
      layout: { background: { color: "#111" }, textColor: "#DDD" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } }
    });
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(candles);

    console.log("Candles loaded:", candles.length);
  } catch (err) {
    console.error("Binance fetch error:", err);
  }
}

// =======================
// CoinGecko Historical Chart
// =======================
async function loadCoinGeckoCandlesInto(coin = "bitcoin", days = 30) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=${days}`;
    const res = await fetch(`/api/coingecko-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    const candles = raw.map(item => ({
      time: item[0] / 1000,
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4]
    }));

    const chartContainer = document.getElementById("coingeckoChart");
    chartContainer.innerHTML = "";
    const chart = LightweightCharts.createChart(chartContainer, {
      width: 800,
      height: 400,
      layout: { background: { color: "#111" }, textColor: "#DDD" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } }
    });
    const candleSeries = chart.addCandlestickSeries();
    candleSeries.setData(candles);

    console.log("CoinGecko chart:", candles.length);
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}

// =======================
// Search Coin Chart
// =======================
async function searchCoinChart(query = "bitcoin") {
  loadCoinGeckoCandlesInto(query, 30);
}

// =======================
// Page Init
// =======================
document.addEventListener("DOMContentLoaded", () => {
  loadFundamentals();
  loadTrending();
  loadTop25();
  loadBinanceCandles("BTCUSDT", "1h", 100);
  loadCoinGeckoCandlesInto("bitcoin", 30);

  // Refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadFundamentals();
      loadTrending();
      loadTop25();
      loadBinanceCandles("BTCUSDT", "1h", 100);
      loadCoinGeckoCandlesInto("bitcoin", 30);
    });
  }

  // Search form
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchCoinChart(searchInput.value.trim().toLowerCase());
      }
    });
  }
});



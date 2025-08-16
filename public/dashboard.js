// ======= Utility =======
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

// ======= Fundamentals =======
async function loadFundamentals() {
  const data = await fetchJSON("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/global");
  const container = document.getElementById("fundamentals-data");
  container.innerHTML = data ? `<pre>${JSON.stringify(data.data, null, 2)}</pre>` : "Error loading fundamentals.";
}

// ======= Trending =======
async function loadTrending() {
  const data = await fetchJSON("/api/coingecko-proxy?url=https://api.coingecko.com/api/v3/search/trending");
  const tbody = document.querySelector("#trending-table tbody");
  tbody.innerHTML = "";
  if (data && data.coins) {
    data.coins.forEach(c => {
      const item = c.item;
      const row = `<tr>
        <td><img src="${item.thumb}" width="24"></td>
        <td>${item.name}</td>
        <td>${item.symbol}</td>
        <td>${item.market_cap_rank}</td>
        <td>${item.price_btc}</td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  }
}

// ======= Top 25 =======
async function loadTop25() {
  const url = "/api/coingecko-proxy?url=" + encodeURIComponent("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1");
  const data = await fetchJSON(url);
  const tbody = document.querySelector("#top25-table tbody");
  tbody.innerHTML = "";
  if (data) {
    data.forEach(c => {
      const row = `<tr>
        <td><img src="${c.image}" width="24"></td>
        <td>${c.name}</td>
        <td>${c.symbol.toUpperCase()}</td>
        <td>$${c.current_price.toLocaleString()}</td>
        <td>${c.price_change_percentage_24h?.toFixed(2)}%</td>
        <td>$${c.market_cap.toLocaleString()}</td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  }
}

// ======= Binance Candles =======
async function loadBinanceCandles() {
  const data = await fetchJSON("/api/binance-proxy?symbol=BTCUSDT&interval=1h&limit=100");
  if (!data) return;

  const chart = LightweightCharts.createChart(document.getElementById("binance-chart"), { width: 800, height: 400 });
  const candleSeries = chart.addCandlestickSeries();

  const formatted = data.map(d => ({
    time: d[0] / 1000,
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4])
  }));

  candleSeries.setData(formatted);
}

// ======= CoinGecko Candles =======
async function loadCoinGeckoCandles() {
  const url = "/api/coingecko-proxy?url=" + encodeURIComponent("https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=30");
  const data = await fetchJSON(url);
  if (!data) return;

  const chart = LightweightCharts.createChart(document.getElementById("coingecko-chart"), { width: 800, height: 400 });
  const candleSeries = chart.addCandlestickSeries();

  const formatted = data.map(d => ({
    time: d[0] / 1000,
    open: d[1],
    high: d[2],
    low: d[3],
    close: d[4]
  }));

  candleSeries.setData(formatted);
}

// ======= Comparison Chart =======
async function loadComparison() {
  const coin = document.getElementById("compare-coin").value;
  const interval = document.getElementById("compare-interval").value;

  const binanceData = await fetchJSON(`/api/binance-proxy?symbol=${coin.toUpperCase()}USDT&interval=${interval}&limit=100`);
  const cgUrl = `/api/coingecko-proxy?url=${encodeURIComponent(`https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=30`)}`;
  const coingeckoData = await fetchJSON(cgUrl);

  const chart = LightweightCharts.createChart(document.getElementById("comparison-chart"), { width: 800, height: 400 });
  const binanceSeries = chart.addLineSeries({ color: "blue" });
  const coingeckoSeries = chart.addLineSeries({ color: "red" });

  if (binanceData) {
    binanceSeries.setData(binanceData.map(d => ({ time: d[0] / 1000, value: parseFloat(d[4]) })));
  }
  if (coingeckoData) {
    coingeckoSeries.setData(coingeckoData.map(d => ({ time: d[0] / 1000, value: d[4] })));
  }
}

// ======= Init =======
document.getElementById("refresh").addEventListener("click", () => {
  loadFundamentals();
  loadTrending();
  loadTop25();
  loadBinanceCandles();
  loadCoinGeckoCandles();
});

document.getElementById("load-comparison").addEventListener("click", loadComparison);

// Auto load on start
loadFundamentals();
loadTrending();
loadTop25();
loadBinanceCandles();
loadCoinGeckoCandles();



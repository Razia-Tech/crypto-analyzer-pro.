// === FETCH USER DATA FROM NETLIFY FUNCTION ===
fetch('/.netlify/functions/user')
  .then(res => res.json())
  .then(data => {
    document.getElementById('userName').textContent = data.name || "User";
    document.getElementById('welcomeMsg').textContent = `Welcome, ${data.name || "User"}!`;
    document.getElementById('memberStatus').textContent = data.status || "Free";
  })
  .catch(() => {
    document.getElementById('userName').textContent = "Guest";
    document.getElementById('memberStatus').textContent = "Free";
  });

// === LOGOUT ===
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/auth/login.html';
});

// === MARKET FUNDAMENTALS FROM COINGECKO ===
async function loadMarketData() {
  const res = await fetch('https://api.coingecko.com/api/v3/global');
  const data = await res.json();
  const m = data.data;
  document.getElementById('marketData').innerHTML = `
    <div>Market Cap: $${(m.total_market_cap.usd/1e9).toFixed(2)}B</div>
    <div>24h Volume: $${(m.total_volume.usd/1e9).toFixed(2)}B</div>
    <div>BTC Dominance: ${m.market_cap_percentage.btc.toFixed(2)}%</div>
    <div>ETH Dominance: ${m.market_cap_percentage.eth.toFixed(2)}%</div>
  `;
}
loadMarketData();

// === LIVE CANDLESTICK CHART FROM BINANCE ===
let chart, candleSeries;
function initChart() {
  chart = LightweightCharts.createChart(document.getElementById('chartContainer'), {
    layout: { background: { color: '#1c1c1c' }, textColor: '#ffd700' },
    grid: { vertLines: { color: '#333' }, horzLines: { color: '#333' } },
  });
  candleSeries = chart.addCandlestickSeries();
}

async function loadCandles(symbol) {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=50`);
  const data = await res.json();
  const formatted = data.map(c => ({
    time: Math.floor(c[0] / 1000),
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
  }));
  candleSeries.setData(formatted);
}

initChart();
let currentPair = "BTCUSDT";
loadCandles(currentPair);

// Pair selector
document.getElementById('pairSelector').addEventListener('change', e => {
  currentPair = e.target.value;
  loadCandles(currentPair);
});

// Auto refresh chart
setInterval(() => loadCandles(currentPair), 60000);



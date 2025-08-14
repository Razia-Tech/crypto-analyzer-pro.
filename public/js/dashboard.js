// Konfigurasi Supabase
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cek Login
async function checkLogin() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "auth/login.html";
  } else {
    document.getElementById("username").innerText = user.email;
    document.getElementById("user-profile").innerText = user.email;
    document.getElementById("membership").innerText = "Free";
  }
}

// Logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "auth/login.html";
});

// Ambil Data Market Fundamentals
async function loadMarketData() {
  const res = await fetch("https://api.coingecko.com/api/v3/global");
  const data = await res.json();
  const m = data.data;
  document.getElementById("market-data").innerHTML = `
    <p>Market Cap: $${(m.total_market_cap.usd/1e9).toFixed(2)}B</p>
    <p>24h Volume: $${(m.total_volume.usd/1e9).toFixed(2)}B</p>
    <p>BTC Dominance: ${m.market_cap_percentage.btc.toFixed(2)}%</p>
  `;
}

// Top 25 Coins Table
async function loadTopCoins() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false");
  const coins = await res.json();
  const tbody = document.querySelector("#coins-table tbody");
  tbody.innerHTML = coins.map((c, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${c.name} (${c.symbol.toUpperCase()})</td>
      <td>$${c.current_price.toLocaleString()}</td>
      <td style="color:${c.price_change_percentage_24h>=0?'lime':'red'}">
        ${c.price_change_percentage_24h.toFixed(2)}%
      </td>
    </tr>
  `).join("");
}

// Candlestick Chart
let chart;
async function initChart(pair="BTCUSDT") {
  const ctx = document.getElementById("candlestickChart").getContext("2d");
  if(chart) chart.destroy();

  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1m&limit=30`);
  const klines = await res.json();

  const labels = klines.map(k => new Date(k[0]).toLocaleTimeString());
  const prices = klines.map(k => k[4]);

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `${pair} Price`,
        data: prices,
        borderColor: "gold",
        backgroundColor: "rgba(255,215,0,0.3)"
      }]
    }
  });
}

// Pair Selector Event
document.getElementById("pair-selector").addEventListener("change", (e) => {
  initChart(e.target.value);
});

// Auto Refresh
setInterval(() => {
  initChart(document.getElementById("pair-selector").value);
}, 60000);

// Load Semua Data
checkLogin();
loadMarketData();
loadTopCoins();
initChart();


// ---------- KONFIG FRONTEND (WAJIB DIEDIT) ----------
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co"; // ganti
const SUPABASE_ANON_KEY = "YOUR-ANON-KEY";               // ganti

// Init supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- AUTH & PROFIL ----------
async function ensureSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    // Jika belum login, arahkan ke halaman login kamu
    window.location.href = "/auth/login.html";
    return;
  }
  return session;
}

async function loadUserFromFunction(access_token) {
  try {
    const res = await fetch("/.netlify/functions/user", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    const user = payload.user || {};
    document.getElementById("userName").textContent = user.full_name || user.email || "User";
    document.getElementById("welcomeMsg").textContent = `Selamat datang, ${user.full_name || user.email || "User"}!`;
    document.getElementById("memberStatus").textContent = user.membership_status || "Free";
    if (user.last_login_at) {
      document.getElementById("lastLogin").textContent = `Login terakhir: ${new Date(user.last_login_at).toLocaleString()}`;
    }
  } catch (e) {
    console.warn("Gagal ambil user dari function:", e);
    document.getElementById("userName").textContent = "User";
    document.getElementById("memberStatus").textContent = "Free";
  }
}

async function boot() {
  const session = await ensureSession();
  if (!session) return;
  const token = session.access_token;
  await loadUserFromFunction(token);
  await loadMarketData();
  await loadTopCoins();
  initChart();
  await loadCandles(currentPair);
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "/auth/login.html";
});
document.getElementById("logoutLink").addEventListener("click", async (e) => {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  window.location.href = "/auth/login.html";
});

// ---------- MARKET FUNDAMENTALS (CoinGecko) ----------
async function loadMarketData() {
  const box = document.getElementById("marketData");
  box.innerHTML = `<div class="tile"><div class="label">Memuat...</div></div>`;
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global");
    const json = await res.json();
    const m = json.data;
    box.innerHTML = `
      <div class="tile"><div class="label">Global Market Cap</div><div class="value">$${(m.total_market_cap.usd/1e12).toFixed(3)}T</div></div>
      <div class="tile"><div class="label">24h Volume</div><div class="value">$${(m.total_volume.usd/1e9).toFixed(2)}B</div></div>
      <div class="tile"><div class="label">BTC Dominance</div><div class="value">${m.market_cap_percentage.btc.toFixed(2)}%</div></div>
      <div class="tile"><div class="label">ETH Dominance</div><div class="value">${m.market_cap_percentage.eth.toFixed(2)}%</div></div>
    `;
  } catch (e) {
    box.innerHTML = `<div class="tile"><div class="label">Gagal memuat data.</div></div>`;
  }
}

// ---------- TOP 25 COINS (CoinGecko) ----------
async function loadTopCoins() {
  const tbody = document.querySelector("#coinsTable tbody");
  tbody.innerHTML = `<tr><td colspan="4">Memuat...</td></tr>`;
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false");
    const coins = await res.json();
    tbody.innerHTML = coins.map((c, i) => {
      const pct = (c.price_change_percentage_24h ?? 0).toFixed(2);
      const cls = (c.price_change_percentage_24h ?? 0) >= 0 ? "pos" : "neg";
      return `
        <tr>
          <td>${i+1}</td>
          <td>${c.name} (${c.symbol.toUpperCase()})</td>
          <td>$${(c.current_price ?? 0).toLocaleString()}</td>
          <td class="pct ${cls}">${isNaN(pct) ? "-" : pct + "%"}</td>
        </tr>
      `;
    }).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4">Gagal memuat data.</td></tr>`;
  }
}

// ---------- CHART (Lightweight Charts + Binance REST) ----------
let chart, candleSeries, currentPair = "BTCUSDT";

function initChart() {
  const container = document.getElementById("chartContainer");
  container.innerHTML = ""; // reset
  chart = LightweightCharts.createChart(container, {
    layout: { background: { color: "#1c1c1c" }, textColor: "#ffd700" },
    grid: { vertLines: { color:"#2b2b2b" }, horzLines: { color:"#2b2b2b" } },
    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    rightPriceScale: { borderVisible: false },
    timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false }
  });
  candleSeries = chart.addCandlestickSeries({
    upColor: '#3bd16f', downColor: '#ff5c5c', borderDownColor: '#ff5c5c',
    wickDownColor:'#ff5c5c', wickUpColor:'#3bd16f', borderUpColor:'#3bd16f'
  });

  document.getElementById("pairSelector").addEventListener("change", async (e) => {
    currentPair = e.target.value;
    await loadCandles(currentPair);
  });

  // auto refresh tiap 60 detik
  setInterval(() => loadCandles(currentPair), 60000);
}

async function loadCandles(symbol) {
  const meta = document.getElementById("chartMeta");
  meta.textContent = `Memuat ${symbol}...`;
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=120`;
    const res = await fetch(url);
    const raw = await res.json();
    const data = raw.map(k => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low:  parseFloat(k[3]),
      close:parseFloat(k[4]),
    }));
    candleSeries.setData(data);
    meta.textContent = `Pair: ${symbol} • Sumber: Binance • ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    meta.textContent = `Gagal memuat chart ${symbol}`;
  }
}

// ---------- BOOT ----------
boot();



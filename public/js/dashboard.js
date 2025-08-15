// ===== Crypto Analyzer Pro - dashboard.js (Netlify proxy edition) =====

// Config base URLs (via Netlify Functions to bypass CORS & cert issues)
const CG = "/.netlify/functions/cg";
const BZ = "/.netlify/functions/binance";

// Boot
document.addEventListener("DOMContentLoaded", () => {
  safeCall(loadMarketFundamentals);
  safeCall(fetchTrendingCoins);
  safeCall(loadTopCoins);
  safeCall(renderCoingeckoChart);
  safeCall(renderBinanceChart);

  const logoutA = document.getElementById("logoutBtn");
  const logoutB = document.getElementById("logoutTopBtn");
  [logoutA, logoutB].forEach(btn => btn && btn.addEventListener("click", logout));
});

function safeCall(fn) {
  try { fn && fn(); } catch (e) { console.error(fn?.name || "fn", e); }
}

function logout() {
  alert("Logout berhasil!");
  location.href = "auth.html";
}

// ===== Market Fundamentals (CoinGecko via proxy) =====
async function loadMarketFundamentals() {
  const el = document.getElementById("marketFundamentals") || document.getElementById("market-cards");
  if (!el) return;
  el.textContent = "Loading...";

  try {
    const res = await fetch(`${CG}/api/v3/global`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const d = json?.data || {};
    const pct = d.market_cap_percentage || {};
    const cap = d.total_market_cap?.usd;
    const vol = d.total_volume?.usd;
    el.innerHTML = `
      🌍 Market Cap: ${cap ? "$" + cap.toLocaleString() : "−"} |
      📊 24H Vol: ${vol ? "$" + vol.toLocaleString() : "−"} |
      ₿ BTC Dom: ${pct.btc?.toFixed?.(2) ?? "−"}% |
      Ξ ETH Dom: ${pct.eth?.toFixed?.(2) ?? "−"}%
    `;
  } catch (e) {
    console.error("Fundamentals error:", e);
    el.textContent = "Gagal memuat market fundamentals";
  }
}

// ===== Trending Coins (CoinGecko via proxy) =====
async function fetchTrendingCoins() {
  const container = document.getElementById("trendingList");
  if (!container) return;
  container.textContent = "Loading...";

  try {
    const res = await fetch(`${CG}/api/v3/search/trending`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const top = (data?.coins || []).slice(0, 7);

    container.innerHTML = "";
    for (const item of top) {
      try {
        const detRes = await fetch(`${CG}/api/v3/coins/${item.item.id}`);
        if (!detRes.ok) throw new Error(`HTTP ${detRes.status}`);
        const c = await detRes.json();
        const price = c?.market_data?.current_price?.usd;
        const p1h = c?.market_data?.price_change_percentage_1h_in_currency?.usd;
        const p24h = c?.market_data?.price_change_percentage_24h;

        const div = document.createElement("div");
        div.className = "trending-card";
        div.innerHTML = `
          <strong>${c.name}</strong> — $${price?.toLocaleString?.() ?? "−"} |
          1H: ${fmtPct(p1h)} | 24H: ${fmtPct(p24h)}
        `;
        container.appendChild(div);
      } catch (e) {
        console.warn("Detail coin gagal:", item?.item?.id, e);
      }
    }
  } catch (e) {
    console.error("Trending error:", e);
    container.textContent = "Gagal memuat trending coins";
  }
}

// ===== Top 25 Coins (Binance + fallback CoinGecko via proxy) =====
let binanceSymbols = [];

async function fetchBinanceSymbols() {
  try {
    const res = await fetch(`${BZ}/api/v3/exchangeInfo`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const arr = data?.symbols;
    binanceSymbols = Array.isArray(arr) ? arr.map(s => s.symbol) : [];
  } catch (e) {
    console.warn("Binance exchangeInfo gagal, lanjut tanpa penanda Binance:", e);
    binanceSymbols = [];
  }
}

async function loadTopCoins() {
  await fetchBinanceSymbols();

  const tbody = document.getElementById("topCoinsTable") || document.querySelector("#topCoinsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`;

  try {
    const url = `${CG}/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=7d`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const coins = await res.json();

    tbody.innerHTML = "";
    coins.forEach((c, i) => {
      const shortRec = getShortTermRecommendation(c.price_change_percentage_24h ?? 0);
      const longRec = getLongTermRecommendation((c.price_change_percentage_7d_in_currency?.usd) ?? 0);
      const sym = `${(c.symbol || "").toUpperCase()}USDT`;
      const onBinance = binanceSymbols.includes(sym);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><img src="${c.image}" width="18" height="18" style="vertical-align:middle;margin-right:6px;"> ${c.name} (${(c.symbol||"").toUpperCase()})</td>
        <td>$${(c.current_price ?? 0).toLocaleString()}</td>
        <td style="color:${(c.price_change_percentage_24h ?? 0) >= 0 ? 'lime' : 'red'}">${fmtPct(c.price_change_percentage_24h)}</td>
        <td>$${(c.total_volume ?? 0).toLocaleString()}</td>
        <td>$${(c.market_cap ?? 0).toLocaleString()}</td>
        <td style="color:${colorRec(shortRec.text)}" title="${shortRec.reason}">${shortRec.text}</td>
        <td style="color:${colorRec(longRec.text)}" title="${longRec.reason}">${longRec.text}</td>
        <td>${onBinance ? '<span style="color:lime">✔ Binance</span>' : `<a href="https://www.coingecko.com/en/coins/${c.id}" target="_blank" rel="noopener">View</a>`}</td>
      `;

      if (onBinance) {
        tr.style.cursor = "pointer";
        tr.addEventListener("click", () => loadChart(`BINANCE:${sym}`));
      }
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Top 25 error:", e);
    tbody.innerHTML = `<tr><td colspan="8">Gagal memuat data</td></tr>`;
  }
}

function getShortTermRecommendation(p24) {
  const x = Number(p24) || 0;
  if (x > 3)  return { text: "BUY",  reason: "Momentum 24h > 3%" };
  if (x < -3) return { text: "SELL", reason: "Penurunan 24h < −3%" };
  return { text: "HOLD", reason: "Sideways 24h" };
}

function getLongTermRecommendation(p7d) {
  const x = Number(p7d) || 0;
  if (x > 10)  return { text: "BUY",  reason: "Kenaikan 7d > 10%" };
  if (x < -10) return { text: "SELL", reason: "Penurunan 7d < −10%" };
  return { text: "HOLD", reason: "Sideways 7d" };
}

function colorRec(text) {
  if (text === "BUY") return "lime";
  if (text === "SELL") return "red";
  return "gold";
}

function fmtPct(v) {
  const x = Number(v);
  if (!isFinite(x)) return "−";
  return `${x.toFixed(2)}%`;
}

// ===== Charts (Chart.js) via proxy =====
async function renderCoingeckoChart() {
  const el = document.getElementById("coingeckoChart");
  if (!el) return;
  try {
    const res = await fetch(`${CG}/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const labels = (data?.prices || []).map(p => new Date(p[0]).toLocaleDateString());
    const prices = (data?.prices || []).map(p => p[1]);

    new Chart(el.getContext("2d"), {
      type: "line",
      data: { labels, datasets: [{ label: "BTC (CoinGecko)", data: prices, borderColor: "gold", fill: false }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } catch (e) {
    console.error("Coingecko chart error:", e);
  }
}

async function renderBinanceChart() {
  const el = document.getElementById("binanceChart");
  if (!el) return;
  try {
    const res = await fetch(`${BZ}/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Format klines bukan array");

    const labels = data.map(d => new Date(d[0]).toLocaleDateString());
    const close = data.map(d => Number(d[4]));

    new Chart(el.getContext("2d"), {
      type: "line",
      data: { labels, datasets: [{ label: "BTC (Binance)", data: close, borderColor: "deepskyblue", fill: false }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } catch (e) {
    console.error("Binance chart error:", e);
  }
}

// ===== TradingView (optional, client-side) =====
function loadChart(symbol = "BINANCE:BTCUSDT") {
  const cont = document.getElementById("tv_chart_container");
  if (!cont || !window.TradingView) return;
  cont.innerHTML = "";
  new TradingView.widget({
    container_id: "tv_chart_container",
    symbol,
    interval: "60",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    width: "100%",
    height: "500",
    studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"]
  });
}

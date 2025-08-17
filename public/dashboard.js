/* ============================
   Crypto Analyzer Pro — Market Fundamentals (CoinGecko)
   ============================ */

const CG_BASE = "https://api.coingecko.com/api/v3";

// ——— util: simple cache (mengurangi rate-limit)
const cache = new Map();
function setCache(key, data, ttlMs = 60_000) {
  cache.set(key, { data, exp: Date.now() + ttlMs });
}
function getCache(key) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data;
  cache.delete(key);
  return null;
}

// ——— util: fetch JSON + cache + error handling
async function cgFetch(path, { ttl = 60_000 } = {}) {
  const url = `${CG_BASE}${path}`;
  const hit = getCache(url);
  if (hit) return hit;

  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
  const json = await res.json();
  setCache(url, json, ttl);
  return json;
}

// ——— util: formatters
const CURRENCY = "USD";
const nfmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const pfmt = (v) => (v > 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`);
function fmtMoneyUSD(n) {
  if (n == null) return "—";
  return "$" + nfmt.format(n);
}

// ============================
// 1) OVERVIEW MARKET
// ============================
async function loadOverviewMarket() {
  try {
    const global = await cgFetch("/global?x_cg_demo_api_key="); // key optional/ignored
    const data = global.data;

    const mcapUSD = data.total_market_cap.usd;
    const volUSD  = data.total_volume.usd;
    const btcDom  = data.market_cap_percentage.btc; // in %
    const ethDom  = data.market_cap_percentage.eth;

    // BTC supply ≈ current supply from /coins/bitcoin (circulating_supply)
    const btc = await cgFetch("/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false", { ttl: 5*60_000 });
    const btcSupply = btc.market_data?.circulating_supply;

    // Update UI
    setText("global-mcap", fmtMoneyUSD(mcapUSD));
    setText("global-vol" , fmtMoneyUSD(volUSD));
    setText("btc-dominance", `${btcDom?.toFixed(1) ?? "—"}%`);
    setText("eth-dominance", `${ethDom?.toFixed(1) ?? "—"}%`);
    setText("btc-supply", btcSupply ? nfmt.format(btcSupply) : "—");
  } catch (e) {
    console.error(e);
    toast("Failed to load Market Overview. Try again.");
  }
}
function setText(id, val){ const el=document.getElementById(id); if(el) el.textContent = val; }
function toast(msg){ console.warn(msg); } // ganti dengan snackbar kamu jika ada

// ============================
// 2) CHART — interaktif (default: Bitcoin)
//    - timeframe: 1 / 7 / 30 (days)
//    - search coin/pair (e.g., DOT/USDT, BTC, polkadot)
// ============================
let marketChart;
const DEFAULT_COIN_ID = "bitcoin";

async function renderCoinChart(coinId = DEFAULT_COIN_ID, days = 7) {
  // ambil historis harga (close) + volume
  // CG returns [timestamp, price] arrays
  try {
    const data = await cgFetch(`/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`);
    const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
    const prices = data.prices.map(p => p[1]);
    const volumes = data.total_volumes.map(v => v[1]);

    const ctx = document.getElementById("marketChart").getContext("2d");
    if (marketChart) marketChart.destroy();

    marketChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${coinId} price (USD)`,
            data: prices,
            borderColor: "#f5d76e",
            backgroundColor: "rgba(245, 215, 110, 0.15)",
            borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0
          },
          {
            label: "Volume (USD, total)",
            data: volumes,
            borderColor: "#00ffc6",
            backgroundColor: "rgba(0,255,198,0.12)",
            borderWidth: 1.5, tension: 0.25, fill: true, pointRadius: 0, yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#f5d76e", font: { family: "Orbitron", size: 12 } } },
          tooltip:{ mode:"index", intersect:false }
        },
        interaction:{ mode:"index", intersect:false },
        scales: {
          x: { ticks: { color: "#f5d76e" }, grid: { color: "#333" } },
          y: { ticks: { color: "#f5d76e" }, grid: { color: "#333" } },
          y1:{ position: "right", ticks:{ color:"#00ffc6" }, grid:{ drawOnChartArea:false } }
        }
      }
    });
  } catch (e) {
    console.error(e);
    toast("Failed to load chart.");
  }
}

// ——— Timeframe buttons (data-range = days)
document.querySelectorAll(".time-btn")?.forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    document.querySelectorAll(".time-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const days = Number(btn.dataset.range || 7);
    const coinId = currentCoinId || DEFAULT_COIN_ID;
    await renderCoinChart(coinId, days);
  });
});

let currentCoinId = DEFAULT_COIN_ID;

// ——— search coin/pair → resolve CoinGecko id
async function resolveCoinId(queryRaw){
  // Accept: "DOT/USDT", "DOT", "polkadot"
  const q = (queryRaw||"").trim().toLowerCase();
  if(!q) return null;

  const base = q.includes("/") ? q.split("/")[0] : q;
  // 1) try search endpoint (ranked results)
  const search = await cgFetch(`/search?query=${encodeURIComponent(base)}`, { ttl: 5*60_000 });
  if (search.coins?.length){
    // prefer exact symbol match, else name match, else first by market_cap_rank
    const exactSym = search.coins.find(c => c.symbol?.toLowerCase() === base);
    if (exactSym) return exactSym.id;
    const exactName = search.coins.find(c => c.name?.toLowerCase() === base);
    if (exactName) return exactName.id;
    // fallback highest ranked
    return search.coins.sort((a,b)=>(a.market_cap_rank??9999)-(b.market_cap_rank??9999))[0].id;
  }
  return null;
}

// ——— Search button
document.getElementById("searchBtn")?.addEventListener("click", async ()=>{
  const inp = document.getElementById("coinSearch");
  const q = inp?.value || "";
  const id = await resolveCoinId(q);
  if(!id){ toast("Coin not found on CoinGecko"); return; }
  currentCoinId = id;
  // keep active timeframe
  const active = document.querySelector(".time-btn.active");
  const days = Number(active?.dataset.range || 7);
  await renderCoinChart(currentCoinId, days);
});

// ============================
// 3) TOP 25 COINS
// ============================
let top25Data = [];
async function loadTop25() {
  try{
    const rows = await cgFetch("/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&price_change_percentage=24h");
    top25Data = rows;
    renderTop25(rows);
  }catch(e){ console.error(e); toast("Failed to load Top 25."); }
}

function renderTop25(rows){
  const tbody = document.getElementById("top25-body");
  if(!tbody) return;
  tbody.innerHTML = "";
  rows.forEach((c, i)=>{
    const tr = document.createElement("tr");
    const change = c.price_change_percentage_24h ?? 0;
    tr.innerHTML = `
      <td>${i+1}</td>
      <td style="display:flex;align-items:center;gap:8px">
        <img src="${c.image}" alt="" width="18" height="18" style="border-radius:50%"/> ${c.name}
      </td>
      <td>${c.symbol?.toUpperCase()}</td>
      <td>${fmtMoneyUSD(c.current_price)}</td>
      <td class="${change>=0?'positive':'negative'}">${pfmt(change)}</td>
      <td>${fmtMoneyUSD(c.market_cap)}</td>
      <td><button class="mini-btn" data-view="${c.id}">View</button></td>
    `;
    tbody.appendChild(tr);
  });

  // hook "View" to chart
  tbody.querySelectorAll("button[data-view]")?.forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      currentCoinId = btn.dataset.view;
      const active = document.querySelector(".time-btn.active");
      const days = Number(active?.dataset.range || 7);
      await renderCoinChart(currentCoinId, days);
      // pindah tab Chart kalau perlu
      const chartTabBtn = document.querySelector('.tab-button[data-tab="fund-chart"]');
      chartTabBtn?.click();
    });
  });
}

// ——— search filter top25 (client-side)
document.getElementById("top25-search")?.addEventListener("input", (e)=>{
  const q = (e.target.value||"").toLowerCase();
  const filtered = top25Data.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.symbol.toLowerCase().includes(q)
  );
  renderTop25(filtered);
});

// ============================
// 4) TRENDING 12
// ============================
async function loadTrending12() {
  try{
    const res = await cgFetch("/search/trending");
    // CG biasanya mengembalikan ~7 coin; kita ambil sampai 12 kalau ada
    const list = (res.coins || []).slice(0,12);
    renderTrending(list);
  }catch(e){ console.error(e); toast("Failed to load Trending."); }
}

function renderTrending(list){
  const tbody = document.getElementById("trending12-body");
  if(!tbody) return;
  tbody.innerHTML = "";
  list.forEach((item, idx)=>{
    const c = item.item; // structure dari CG
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td style="display:flex;align-items:center;gap:8px">
        <img src="${c.small}" alt="" width="18" height="18" style="border-radius:50%"/> ${c.name}
      </td>
      <td>${(c.symbol||"").toUpperCase()}</td>
      <td>${fmtMoneyUSD(c.data?.price || c.price_btc* (item.bitcoin_price??0) || 0)}</td>
      <td>${c.market_cap_rank ?? "—"}</td>
      <td><button class="mini-btn" data-trend="${c.id}">View</button></td>
    `;
    tbody.appendChild(tr);
  });

  // "View" → buka chart coin
  tbody.querySelectorAll("button[data-trend]")?.forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      currentCoinId = btn.dataset.trend;
      const active = document.querySelector(".time-btn.active");
      const days = Number(active?.dataset.range || 7);
      await renderCoinChart(currentCoinId, days);
      document.querySelector('.tab-button[data-tab="fund-chart"]')?.click();
    });
  });
}

// ============================
// Init hooks pada saat tab dibuka
// (biar nggak mengganggu fitur lain yang sudah ada)
// ============================
function ensureOnce(fn){
  let called=false;
  return () => { if(!called){ called=true; fn(); } };
}
const initOverviewOnce   = ensureOnce(loadOverviewMarket);
const initTop25Once      = ensureOnce(loadTop25);
const initTrending12Once = ensureOnce(loadTrending12);
const initChartOnce      = ensureOnce(()=>renderCoinChart(DEFAULT_COIN_ID, 7));

// Saat user klik tab di Market Fundamentals
document.querySelectorAll(".tab-button")?.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const tab = btn.dataset.tab;
    if(tab === "overview")   initOverviewOnce();
    if(tab === "top25")      initTop25Once();
    if(tab === "trending12") initTrending12Once();
    if(tab === "fund-chart") initChartOnce();
  });
});

// Optional: load overview on first paint (kalau Overview default aktif)
document.addEventListener("DOMContentLoaded", () => {
  const overviewActive = document.getElementById("overview")?.classList.contains("active");
  if (overviewActive) initOverviewOnce();
});

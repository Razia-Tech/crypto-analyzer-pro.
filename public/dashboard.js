// =========================
// dashboard.js (FULL)
// =========================

// ---- Config ----
const DEFAULT_SYMBOL = "BTCUSDT";
const DEFAULT_INTERVAL = "1h";
const DEFAULT_LIMIT = 100;
const DEFAULT_CG_COIN = "bitcoin";

// Ganti ini dengan URL Worker Anda
const BINANCE_PROXY_URL = "https://binance-proxy.yourname.workers.dev";

// ---- State ----
const AppState = {
  currentCoinId: DEFAULT_CG_COIN,
  tvLoaded: false,
};

// ---- Helper ----
function $(id) {
  return document.getElementById(id);
}

function setHTML(el, html) {
  if (typeof el === "string") {
    const node = $(el);
    if (node) node.innerHTML = html;
  } else if (el) {
    el.innerHTML = html;
  }
}

function safeNumber(n, digits = 2) {
  const num = Number(n);
  if (Number.isFinite(num)) return num.toFixed(digits);
  return "-";
}

function renderCandles(container, candles) {
  container.innerHTML = "";
  const width = container.clientWidth || 800;
  const chart = LightweightCharts.createChart(container, { width, height: 400 });
  const series = chart.addCandlestickSeries();
  series.setData(candles.map(c => ({
    time: Math.floor(c.time),
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
  })));
  window.addEventListener("resize", () =>
    chart.applyOptions({ width: container.clientWidth || width })
  );
}

// ---- Section Switcher ----
function showSection(id) {
  document.querySelectorAll(".section").forEach((s) => s.classList.add("hidden"));
  const sec = $(id);
  if (sec) sec.classList.remove("hidden");

  if (id === "fundamentals") loadFundamentals();
  if (id === "trending") loadTrending();
  if (id === "top25") loadTop25();
  if (id === "tvchart") loadTradingView();
  if (id === "binanceChart") loadBinanceCandles(DEFAULT_SYMBOL, DEFAULT_INTERVAL, DEFAULT_LIMIT);
  if (id === "searchChart") loadCoinGeckoCandlesInto("searchChartContainer", AppState.currentCoinId);
}

// ========== 1) Market Fundamentals (CoinGecko: Bitcoin) ==========
async function loadFundamentals() {
  const target = $("fundamentalsData");
  setHTML(target, `<p style="color:gray">Loading...</p>`);
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const md = data.market_data || {};
    setHTML(
      target,
      `
      <p><b>${data.name} (${String(data.symbol || "").toUpperCase()})</b></p>
      <p>Price: $${(md.current_price?.usd ?? "-").toLocaleString?.() || md.current_price?.usd || "-"}</p>
      <p>Market Cap: $${(md.market_cap?.usd ?? "-").toLocaleString?.() || md.market_cap?.usd || "-"}</p>
      <p>Volume 24h: $${(md.total_volume?.usd ?? "-").toLocaleString?.() || md.total_volume?.usd || "-"}</p>
      <p>Community Score: ${data.community_score ?? "-"}</p>
      <p>Developer Score: ${data.developer_score ?? "-"}</p>
    `
    );
  } catch (err) {
    setHTML(target, `<p style="color:red">Error load fundamentals: ${err.message}</p>`);
  }
}

// ========== 2) Trending (CoinGecko) ==========
async function loadTrending() {
  const list = $("trendingList");
  setHTML(list, `<p style="color:gray">Loading...</p>`);
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setHTML(list, "");
    (data.coins || []).forEach((c, i) => {
      const item = c.item || {};
      list.innerHTML += `
        <div class="trending-coin">
          <span>${i + 1}. <img src="${item.thumb}" width="16" height="16" alt=""/> ${item.name} (${item.symbol})</span>
          <span class="badge">Rank: ${item.market_cap_rank ?? "-"}</span>
        </div>`;
    });
  } catch (err) {
    setHTML(list, `<p style="color:red">Error load trending: ${err.message}</p>`);
  }
}

// ========== 3) Top 25 (CoinGecko) ==========
async function loadTop25() {
  const tbody = $("top25Table");
  setHTML(tbody, `<tr><td colspan="6" style="color:gray">Loading...</td></tr>`);
  try {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setHTML(tbody, "");
    data.forEach((coin, i) => {
      const ch = Number(coin.price_change_percentage_24h);
      const cls = ch >= 0 ? "up" : "down";
      tbody.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td><img src="${coin.image}" width="16" height="16" alt=""/> ${coin.name} (${String(
            coin.symbol || ""
          ).toUpperCase()})</td>
          <td>$${Number(coin.current_price).toLocaleString()}</td>
          <td class="${cls}">${safeNumber(ch, 2)}%</td>
          <td>$${Number(coin.market_cap).toLocaleString()}</td>
          <td>$${Number(coin.total_volume).toLocaleString()}</td>
        </tr>`;
    });
  } catch (err) {
    setHTML(tbody, `<tr><td colspan="6" style="color:red">Error: ${err.message}</td></tr>`);
  }
}

// ========== 4) TradingView Chart ==========
function loadTradingView() {
  if (AppState.tvLoaded) return;
  AppState.tvLoaded = true;
  // eslint-disable-next-line no-undef
  new TradingView.widget({
    container_id: "tradingview",
    autosize: true,
    symbol: "BINANCE:BTCUSDT",
    interval: "60",
    theme: "dark",
    style: "1",
    locale: "en",
  });
}

// ========== 5) Binance Candlestick (via Cloudflare Proxy, fallback CG) ==========
async function loadBinanceCandles(symbol = DEFAULT_SYMBOL, interval = DEFAULT_INTERVAL, limit = DEFAULT_LIMIT) {
  const container = $("binanceCandleContainer");
  setHTML(container, `<p style="color:gray">Loading Binance candles...</p>`);

  try {
    const res = await fetch(
      `${BINANCE_PROXY_URL}?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(
        interval
      )}&limit=${encodeURIComponent(String(limit))}`
    );
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const data = await res.json();
    const candles = (Array.isArray(data) ? data : []).map(c => ({
      time: Number(c[0]) / 1000,
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
    }));
    renderCandles(container, candles);
    return;
  } catch (err) {
    console.warn("Binance via proxy gagal:", err.message);
    setHTML(container, `<p style="color:#f59e0b">Binance tidak tersedia. Menampilkan data CoinGecko (30D)...</p>`);
    await loadCoinGeckoCandlesInto(container, AppState.currentCoinId);
  }
}

// ========== 6) CoinGecko Candlestick (OHLC 30D) ==========
async function loadCoinGeckoCandlesInto(target, coinId) {
  const container = typeof target === "string" ? $(target) : target;
  if (!container) return;

  setHTML(container, `<p style="color:gray">Loading CoinGecko OHLC...</p>`);
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/ohlc?vs_currency=usd&days=30`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const candles = (Array.isArray(data) ? data : []).map((row) => ({
      time: Math.floor(Number(row[0]) / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
    }));
    renderCandles(container, candles);
  } catch (err) {
    setHTML(container, `<p style="color:red">CoinGecko error: ${err.message}</p>`);
  }
}

// ========== Search (CoinGecko resolve) ==========
async function resolveCoinId(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return DEFAULT_CG_COIN;
  try {
    const test = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(q)}`);
    if (test.ok) return q;
  } catch {}
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const first = (data.coins || [])[0];
    if (first && first.id) return first.id;
  } catch {}
  return DEFAULT_CG_COIN;
}

$("searchInput").addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const raw = e.target.value || "";
    const coinId = await resolveCoinId(raw);
    AppState.currentCoinId = coinId;
    showSection("searchChart");
  }
});

// Refresh button
$("refreshBtn").addEventListener("click", () => {
  const active = document.querySelector(".section:not(.hidden)");
  if (active) showSection(active.id);
});

// Default section
showSection("fundamentals");


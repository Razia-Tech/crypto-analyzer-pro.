// dashboard.js (ESM)
// Kaio: v1 scaffolding with live data from CoinGecko + Binance + TradingView.
// Keys: CoinGecko (optional for public), Binance (none for public market data), others reserved.

const state = {
  vsCurrency: 'usd',
  tvSymbol: 'BINANCE:BTCUSDT',
  binanceSymbol: 'btcusdt',
  ws: null,
  binanceSeries: null,
  searchSeries: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const money = (n, cur) => cur.toUpperCase() === 'IDR' ? new Intl.NumberFormat('id-ID').format(n) : new Intl.NumberFormat('en-US', { style:'currency', currency: cur.toUpperCase(), maximumFractionDigits: (cur==='idr'?0:2) }).format(n);
const pct = (n) => `${n>0?'+':''}${n.toFixed(2)}%`;

// Basic fetch with timeout
async function getJSON(url, init={}){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), 15000);
  try{
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

// =============== CoinGecko ===============
async function loadFundamentals(){
  const url = `https://api.coingecko.com/api/v3/global`;
  const data = await getJSON(url);
  const g = data.data;
  const vc = state.vsCurrency;
  const dom = $('#fundamentalsCards');
  dom.innerHTML = '';
  const items = [
    { label:'Total Market Cap', value: money(g.total_market_cap[vc], vc) },
    { label:'24h Volume', value: money(g.total_volume[vc], vc) },
    { label:'BTC Dominance', value: pct(g.market_cap_percentage.btc) },
    { label:'ETH Dominance', value: pct(g.market_cap_percentage.eth) },
    { label:'Active Cryptos', value: fmt.format(g.active_cryptocurrencies) },
    { label:'Markets', value: fmt.format(g.markets) },
  ];
  for(const it of items){
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div class="label">${it.label}</div><div class="value">${it.value}</div>`;
    dom.appendChild(el);
  }
}

async function loadTrending(){
  const vc = state.vsCurrency;
  // Using top gainers from first 100 by mcap as a practical "Trending 12"
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vc}&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h`;
  const rows = await getJSON(url);
  const top = rows
    .filter(r => r.price_change_percentage_24h != null)
    .sort((a,b)=> b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0,12);
  const grid = $('#trendingGrid');
  grid.innerHTML = '';
  for(const c of top){
    const el = document.createElement('div');
    el.className = 'coin';
    const changeClass = c.price_change_percentage_24h >= 0 ? 'up' : 'down';
    el.innerHTML = `
      <div class="row"><strong>${c.symbol.toUpperCase()}</strong><span class="badge">Rank ${c.market_cap_rank}</span></div>
      <div class="row"><span>${c.name}</span><span>${money(c.current_price, vc)}</span></div>
      <div class="row"><span>24h</span><strong class="change ${changeClass}">${pct(c.price_change_percentage_24h)}</strong></div>
    `;
    el.addEventListener('click', ()=>{
      mountTradingView(`BINANCE:${c.symbol.toUpperCase()}USDT`);
      mountBinance(`$${c.symbol.toLowerCase()}usdt`);
      loadSearchChart(c.id);
    });
    grid.appendChild(el);
  }
}

async function loadTop25(){
  const vc = state.vsCurrency;
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vc}&order=market_cap_desc&per_page=25&page=1&price_change_percentage=24h`;
  const rows = await getJSON(url);
  const tbody = $('#top25Table tbody');
  tbody.innerHTML = '';
  rows.forEach((r, i)=>{
    const tr = document.createElement('tr');
    const pc = r.price_change_percentage_24h ?? 0;
    const cls = pc>=0? 'up':'down';
    tr.innerHTML = `
      <td>${r.market_cap_rank ?? (i+1)}

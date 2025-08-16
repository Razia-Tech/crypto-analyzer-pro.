// v3 with search-driven symbol updates
const state = { tvSymbol:'BTCUSDT', binanceSymbol:'BTCUSDT', ws:null };

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function refreshData(){ main(); }

// ===== Helpers
function fmtMoneyUSD(n){ try{return '$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});}catch{return '$'+n;} }
function fmtPct(n){ if(n==null) return '-'; const x=Number(n); return (x>=0?'+':'')+x.toFixed(2)+'%'; }

// ===== Fundamentals
async function loadFundamentals(){
  const el=document.getElementById('fundamentalsData'); el.innerHTML='Loading...';
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/global'); const d=await r.json(); const g=d.data;
    el.innerHTML = `
      <div>Total Market Cap: ${fmtMoneyUSD(g.total_market_cap.usd)}</div>
      <div>24h Volume: ${fmtMoneyUSD(g.total_volume.usd)}</div>
      <div>BTC Dominance: ${g.market_cap_percentage.btc.toFixed(2)}%</div>
      <div>ETH Dominance: ${g.market_cap_percentage.eth.toFixed(2)}%</div>
      <div>Active Cryptos: ${g.active_cryptocurrencies}</div>
      <div>Markets: ${g.markets}</div>`;
  }catch(e){ el.innerHTML='Failed to load fundamentals'; console.error(e); }
}

// ===== Trending
async function loadTrending(){
  const wrap=document.getElementById('trendingList'); wrap.innerHTML='Loading...';
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/search/trending'); const d=await r.json();
    wrap.innerHTML='';
    d.coins.slice(0,12).forEach((c,i)=>{
      const coin=c.item;
      const div=document.createElement('div'); div.className='trending-coin';
      div.innerHTML=`<span>${i+1}. <img src="${coin.thumb}" width="18" height="18" style="vertical-align:middle;border-radius:50%;"> ${coin.name} (${coin.symbol.toUpperCase()})</span>
                     <span class="badge">Rank ${coin.market_cap_rank??'-'}</span>`;
      div.addEventListener('click',()=> setActiveSymbol(coin.symbol.toUpperCase()+'USDT', coin.id));
      wrap.appendChild(div);
    });
  }catch(e){ wrap.innerHTML='Failed to load trending'; console.error(e); }
}

// ===== Top 25
async function loadTop25(){
  const tbody=document.getElementById('top25Table'); tbody.innerHTML='<tr><td colspan="6">Loading...</td></tr>';
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h');
    const data=await r.json(); tbody.innerHTML='';
    data.forEach((c,i)=>{
      const tr=document.createElement('tr'); const pc=c.price_change_percentage_24h;
      tr.innerHTML=`<td>${c.market_cap_rank??(i+1)}</td>
        <td><img src="${c.image}" width="18" height="18" style="vertical-align:middle;border-radius:50%;"> ${c.name} (${c.symbol.toUpperCase()})</td>
        <td>${fmtMoneyUSD(c.current_price)}</td>
        <td class="${pc>=0?'up':'down'}">${fmtPct(pc)}</td>
        <td>${fmtMoneyUSD(c.market_cap)}</td>
        <td>${fmtMoneyUSD(c.total_volume)}</td>`;
      tr.addEventListener('click',()=> setActiveSymbol(c.symbol.toUpperCase()+'USDT', c.id));
      tbody.appendChild(tr);
    });
  }catch(e){ tbody.innerHTML='<tr><td colspan="6">Failed to load</td></tr>'; console.error(e); }
}

// ===== TradingView
function mountTradingView(symbol='BTCUSDT'){
  const container=document.getElementById('tradingview');
  container.innerHTML='';
  new TradingView.widget({
    container_id:'tradingview',
    autosize:true,
    symbol:'BINANCE:'+symbol,
    interval:'60',
    theme:'dark',
    timezone:'Etc/UTC',
    style:'1',
    locale:'en',
    allow_symbol_change:true
  });
}

// ===== Binance Candlestick (Lightweight-Charts + WS)
let binanceChart, binanceSeries;
function mountBinance(symbol = 'BTCUSDT') {
  const container = document.getElementById('binanceCandleContainer');
  if (!container) {
    console.error('mountBinance: container not found (id=binanceCandleContainer)');
    return;
  }

   // Pastikan library ada
  if (!window.LightweightCharts || typeof LightweightCharts.createChart !== 'function') {
    console.error('mountBinance: LightweightCharts library not loaded.');
    container.innerHTML = '<div style="padding:16px;color:#f88">Charts library missing. Check script include.</div>';
    return;
  }
  
  // Close old WS
 //* if(state.ws){ try{ state.ws.close(); }catch{} state.ws=null; } *//
  // Create chart
  binanceChart = LightweightCharts.createChart(container, {
    width: container.clientWidth, height: 420,
    layout:{ background:{ color:'#0f141b' }, textColor:'#e5e7eb' },
    grid:{ vertLines:{ color:'#1f2937' }, horzLines:{ color:'#1f2937' } },
    rightPriceScale:{ borderVisible:false }, timeScale:{ borderVisible:false }
  });
 window.__binanceChart = chart;
  window.__binanceSeries = series;

  // load history (graceful)
  fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=400`)
    .then(res => res.json())
    .then(kl => {
      const candles = kl.map(k => ({
        time: Math.floor(k[0] / 1000),
        open: +k[1], high: +k[2], low: +k[3], close: +k[4]
      }));
      series.setData(candles);
      chart.timeScale().fitContent();
    })
    .catch(err => {
      console.warn('mountBinance: failed to load history', err);
    });

  / // websocket live
  try {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
    state.ws = ws;
    ws.onopen = () => console.log('Binance WS open', symbol);
    ws.onerror = (e) => console.warn('Binance WS error', e);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (!msg.k) return;
        const k = msg.k;
        series.update({
          time: Math.floor(k.t / 1000),
          open: +k.o, high: +k.h, low: +k.l, close: +k.c
        });
      } catch (e) { console.error('WS parse/update error', e); }
    };
    ws.onclose = () => console.log('Binance WS closed');
  } catch (e) {
    console.error('mountBinance: websocket failed', e);
  }


// Bersihkan container & buat chart baru
  container.innerHTML = '';
  const chart = LightweightCharts.createChart(container, {
    width: Math.max(300, container.clientWidth),
    height: 420,
    layout: { background: { color: '#0f141b' }, textColor: '#e5e7eb' },
    grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
    rightPriceScale: { borderVisible: false },
    timeScale: { borderVisible: false }
  });
  const series = chart.addCandlestickSeries();

async function loadSearchChart(coinId='bitcoin'){
  if(!searchChart) ensureSearchChart();
  try{
    const r=await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`);
    const d=await r.json();
    const series=d.prices.map(([ts,price])=>({ time:Math.floor(ts/1000), value:+price }));
    searchLine.setData(series);
    searchChart.timeScale().fitContent();
  }catch(e){
    const container=document.getElementById('searchChartContainer');
    container.innerHTML='Failed to load search chart'; console.error(e);
  }
}

// ===== Search input -> update all charts
function wireSearch(){
  const input=document.getElementById('searchInput');
  input.addEventListener('keydown', async (e)=>{
    if(e.key!=='Enter') return;
    const q=input.value.trim().toLowerCase(); if(!q) return;
    try{
      const r=await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`);
      const s=await r.json();
      const hit=s.coins?.[0];
      if(!hit){ alert('Coin not found'); return; }
      // Update all
      setActiveSymbol(hit.symbol.toUpperCase()+'USDT', hit.id);
      showSection('tvchart');
    }catch(err){
      console.error(err); alert('Search failed');
    }
  });
}

// ===== Single entry point to switch symbol
function setActiveSymbol(symbolUSDT, coingeckoId){
  state.tvSymbol = symbolUSDT;
  state.binanceSymbol = symbolUSDT;
  mountTradingView(symbolUSDT);
  mountBinance(symbolUSDT);
  if(coingeckoId) loadSearchChart(coingeckoId);
}

// ===== Main
async function main(){
  document.getElementById('refreshBtn').addEventListener('click', refreshData);
  wireSearch();
  await Promise.all([loadFundamentals(), loadTrending(), loadTop25()]);
  // initial
  mountTradingView(state.tvSymbol);
  mountBinance(state.binanceSymbol);
  loadSearchChart('bitcoin');
}
main();

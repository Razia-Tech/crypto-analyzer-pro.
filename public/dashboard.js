// dashboard.js
const state = { vsCurrency: 'usd', tvSymbol: 'BINANCE:BTCUSDT', binanceSymbol: 'btcusdt', ws: null };

const $ = (s, r=document)=>r.querySelector(s);
const fmt = new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const money = (n,cur)=> new Intl.NumberFormat('en-US',{style:'currency',currency:cur.toUpperCase(),maximumFractionDigits:2}).format(n);
const pct = n=> `${n>0?'+':''}${n.toFixed(2)}%`;

async function getJSON(url){ const r=await fetch(url); if(!r.ok) throw new Error(r.status); return await r.json(); }

async function loadFundamentals(){
  const d=await getJSON('https://api.coingecko.com/api/v3/global'); const g=d.data; const vc=state.vsCurrency;
  const dom=$('#fundamentalsCards'); dom.innerHTML='';
  const items=[
    {label:'Total Market Cap',value:money(g.total_market_cap[vc],vc)},
    {label:'24h Volume',value:money(g.total_volume[vc],vc)},
    {label:'BTC Dominance',value:pct(g.market_cap_percentage.btc)},
    {label:'ETH Dominance',value:pct(g.market_cap_percentage.eth)},
  ];
  for(const it of items){ const el=document.createElement('div'); el.className='card'; el.innerHTML=`<div>${it.label}</div><div>${it.value}</div>`; dom.appendChild(el); }}

async function loadTrending() {
  const container = document.getElementById('trending');
  container.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
    const data = await res.json();
    container.innerHTML = "";
    data.coins.slice(0,12).forEach((c, i) => {
      const coin = c.item;
      const div = document.createElement("div");
      div.className = "trending-coin";
      div.innerHTML = `
        <span>${i+1}. <img src="${coin.thumb}" width="20"> ${coin.name} (${coin.symbol.toUpperCase()})</span>
        <span>Rank: ${coin.market_cap_rank || "-"}</span>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load trending coins.</p>";
  }
}


async function loadTop25(){
  const vc=state.vsCurrency; const rows=await getJSON(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vc}&order=market_cap_desc&per_page=25&page=1&price_change_percentage=24h`);
  const tbody=$('#top25Table tbody'); tbody.innerHTML='';
  rows.forEach(r=>{ const tr=document.createElement('tr'); const pc=r.price_change_percentage_24h??0; const cls=pc>=0?'up':'down';
    tr.innerHTML=`<td>${r.market_cap_rank}</td><td>${r.name} (${r.symbol.toUpperCase()})</td><td>${money(r.current_price,vc)}</td><td class='${cls}'>${pct(pc)}</td><td>${money(r.market_cap,vc)}</td><td>${money(r.total_volume,vc)}</td>`;
    tbody.appendChild(tr);});}

function mountTradingView(symbol){ state.tvSymbol=symbol; $('#tvWidget').innerHTML=''; new TradingView.widget({symbol,interval:'60',container_id:'tvWidget',autosize:true,theme:'dark'}); }

let binanceChart,binanceSeries;
function mountBinance(symbol="BTCUSDT") {
  const container = document.getElementById('binanceChart');container.innerHTML = "";
  const chart = LightweightCharts.createChart(container, {width: container.clientWidth,height: 400,layout: { background: { color: "#0d1117" }, textColor: "#d1d4dc" },grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },});
  const candleSeries = chart.addCandlestickSeries();

  // Binance WebSocket
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
  ws.onmessage = (event) => {const msg = JSON.parse(event.data);const k = msg.k;candleSeries.update({time: k.t / 1000,open: parseFloat(k.o),high: parseFloat(k.h),low: parseFloat(k.l),close: parseFloat(k.c),});};}


async function main(){ bindUI(); await loadFundamentals(); await loadTop25(); mountTradingView(state.tvSymbol); mountBinance('BTCUSDT'); }
main().catch(console.error);

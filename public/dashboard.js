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
  for(const it of items){ const el=document.createElement('div'); el.className='card'; el.innerHTML=`<div>${it.label}</div><div>${it.value}</div>`; dom.appendChild(el); }
}

async function loadTop25(){
  const vc=state.vsCurrency; const rows=await getJSON(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vc}&order=market_cap_desc&per_page=25&page=1&price_change_percentage=24h`);
  const tbody=$('#top25Table tbody'); tbody.innerHTML='';
  rows.forEach(r=>{ const tr=document.createElement('tr'); const pc=r.price_change_percentage_24h??0; const cls=pc>=0?'up':'down';
    tr.innerHTML=`<td>${r.market_cap_rank}</td><td>${r.name} (${r.symbol.toUpperCase()})</td><td>${money(r.current_price,vc)}</td><td class='${cls}'>${pct(pc)}</td><td>${money(r.market_cap,vc)}</td><td>${money(r.total_volume,vc)}</td>`;
    tbody.appendChild(tr);
  });
}

function mountTradingView(symbol){ state.tvSymbol=symbol; $('#tvWidget').innerHTML=''; new TradingView.widget({symbol,interval:'60',container_id:'tvWidget',autosize:true,theme:'dark'}); }

let binanceChart,binanceSeries;
function ensureBinance(){ if(binanceChart) return; binanceChart=LightweightCharts.createChart($('#binanceChart'),{layout:{background:{type:'solid',color:'#121826'},textColor:'#e5e7eb'}}); binanceSeries=binanceChart.addCandlestickSeries(); }
function mountBinance(symbol){ ensureBinance(); fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=100`).then(r=>r.json()).then(kl=>{binanceSeries.setData(kl.map(k=>({time:Math.floor(k[0]/1000),open:+k[1],high:+k[2],low:+k[3],close:+k[4]})));}); }

function bindUI(){ $('#refreshBtn').addEventListener('click',()=>{loadFundamentals();loadTop25();}); }

async function main(){ bindUI(); await loadFundamentals(); await loadTop25(); mountTradingView(state.tvSymbol); mountBinance('BTCUSDT'); }
main().catch(console.error);
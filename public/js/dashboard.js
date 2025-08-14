// ==========================
// WELCOME MESSAGE
// ==========================
function setWelcomeMessage() {
  const welcomeEl = document.getElementById('welcomeMessage');
  const username = 'Kaio';
  const membership = 'Free';
  welcomeEl.textContent = `Welcome to Crypto Analyzer Pro — ${username} (${membership} Member)`;
}
setWelcomeMessage();

// ==========================
// LOGOUT FUNCTION
// ==========================
function setupLogout() {
  const headerLogout = document.getElementById('logout-btn');
  const sidebarLogout = document.getElementById('sidebarLogout');
  const logoutAction = () => {console.log("User logged out");window.location.href = '/login.html';};
  headerLogout.addEventListener('click', logoutAction);
  sidebarLogout.addEventListener('click', logoutAction);
}
setupLogout();

// ==========================
// MARKET FUNDAMENTALS (Dummy)
// ==========================
function loadMarketFundamentals() {
  const container = document.getElementById('market-cards');
  const dummyData = [
    { title: 'BTC Dominance', value: '48.5%' },
    { title: '24h Volume', value: '$65.2B' },
    { title: 'Total Market Cap', value: '$1.9T' },
    { title: 'Fear & Greed Index', value: 'Greed (74)' }
  ];

  container.innerHTML = '';
  dummyData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${item.title}</h3><p>${item.value}</p>`;
    container.appendChild(card);
  });
}
loadMarketFundamentals();

// ==========================
// REKOMENDASI RULE
// ==========================
function getShortTermRecommendation(change24h) {
  if (change24h > 3) return { text: "BUY", reason: "Momentum positif > 3% dalam 24 jam" };
  if (change24h >= 0) return { text: "HOLD", reason: "Pergerakan stabil (0%–3%) dalam 24 jam" };
  return { text: "SELL", reason: "Harga turun dalam 24 jam" };
}

function getLongTermRecommendation(change7d) {
  if (change7d > 10) return { text: "BUY", reason: "Kenaikan signifikan > 10% dalam 7 hari" };
  if (change7d >= 0) return { text: "HOLD", reason: "Pergerakan stabil (0%–10%) dalam 7 hari" };
  return { text: "SELL", reason: "Harga turun dalam 7 hari" };
}


// ==========================
// TOP 25 COINS (Dummy)
// ==========================
async function loadTopCoins() {
  const tableBody = document.querySelector('#topCoinsTable tbody');
  tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=7d");
    const coins = await res.json();

    tableBody.innerHTML = '';
    coins.forEach((coin, index) => {
      const shortRec = getShortTermRecommendation(coin.price_change_percentage_24h);
      const longRec = getLongTermRecommendation(coin.price_change_percentage_7d_in_currency?.usd || 0);
     
      const row = document.createElement('tr');
     
      // Klik baris coin → ganti chart
    row.addEventListener('click', () => {
      const symbol = coin.symbol.toUpperCase();
      const chartSymbol = `BINANCE:${symbol}USDT`;
      loadChart(chartSymbol);
   
      // Highlight baris aktif
      document.querySelectorAll('#topCoinsTable tbody tr').forEach(r => r.classList.remove('active-row'));
    row.classList.add('active-row');
    });

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${coin.image}" alt="${coin.name}" width="20" style="vertical-align:middle; margin-right:5px;"> ${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td style="color:${coin.price_change_percentage_24h >= 0 ? 'lime' : 'red'}">
          ${coin.price_change_percentage_24h?.toFixed(2)}%
        </td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td title="${shortRec.reason}" style="color:${shortRec.text === 'BUY' ? 'lime' : shortRec.text === 'SELL' ? 'red' : 'gold'}">
          ${shortRec.text}
        </td>
        <td title="${longRec.reason}" style="color:${longRec.text === 'BUY' ? 'lime' : longRec.text === 'SELL' ? 'red' : 'gold'}">
          ${longRec.text}
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading coins:", error);
    tableBody.innerHTML = `<tr><td colspan="7">Failed to load data</td></tr>`;
  }
}
loadTopCoins();

function loadChart(symbol) {
  document.getElementById("tv_chart_container").innerHTML = ""; // Reset container
  new TradingView.widget({
    "container_id": "tv_chart_container",
    "symbol": symbol,
    "interval": "60",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#000000",
    "enable_publishing": false,
    "hide_top_toolbar": false,
    "hide_legend": false,
    "save_image": false,
    "studies": ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
    "width": "100%",
    "height": "500"
  });
}

// Load chart default BTC
loadChart("BINANCE:BTCUSDT");

// Event listener untuk dropdown
document.getElementById("pairSelect").addEventListener("change", function () {
  loadChart(this.value);
});


// ==========================
// LIVE CHART (Binance API)
// ==========================
let candlestickChartInstance = null;
let currentPair = 'BTCUSDT';

async function fetchCandlestickData(symbol = 'BTCUSDT', interval = '1h', limit = 50) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.map(c => ({
    x: new Date(c[0]),
    o: parseFloat(c[1]),
    h: parseFloat(c[2]),
    l: parseFloat(c[3]),
    c: parseFloat(c[4])
  }));
}

async function renderCandlestickChart(symbol) {
  const ctx = document.getElementById('candlestickChart').getContext('2d');
  const chartData = await fetchCandlestickData(symbol);

  if (candlestickChartInstance) {
    candlestickChartInstance.destroy();
  }

  candlestickChartInstance = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: symbol,
        data: chartData,
        borderColor: '#FFD700',
        color: {
          up: '#00ff99',
          down: '#ff3366',
          unchanged: '#999'
        }
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: '#FFD700' } }
      },
      scales: {
        x: {
          time: { unit: 'day' },
          ticks: { color: '#FFD700' }
        },
        y: {
          ticks: { color: '#FFD700' }
        }
      }
    }
  });
}

document.getElementById('pairSelector').addEventListener('change', async (e) => {
  currentPair = e.target.value;
  await renderCandlestickChart(currentPair);
});

setInterval(() => {
  renderCandlestickChart(currentPair);
}, 60000);

renderCandlestickChart(currentPair);
// ==========================
// PAIR SELECTOR & AUTO-REFRESH
// ==========================
document.getElementById('pairSelector').addEventListener('change', async (e) => {
  currentPair = e.target.value;
  await renderCandlestickChart(currentPair);
});

// Refresh chart tiap 60 detik
setInterval(() => {
  renderCandlestickChart(currentPair);
}, 60000);

// Load pertama kali
renderCandlestickChart(currentPair);


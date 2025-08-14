// ==========================
// WELCOME MESSAGE
// ==========================
function setWelcomeMessage() {
  const welcomeEl = document.getElementById('welcomeMessage');
  // Dummy user data (nanti ambil dari Supabase)
  const username = 'Kaio';
  const membership = 'Free'; // atau 'Premium'
  welcomeEl.textContent = `Welcome to Crypto Analyzer Pro — ${username} (${membership} Member)`;
}
setWelcomeMessage();

// ==========================
// LOGOUT FUNCTION
// ==========================
function setupLogout() {
  const headerLogout = document.getElementById('logout-btn');
  const sidebarLogout = document.getElementById('sidebarLogout');

  const logoutAction = () => {
    // TODO: tambahkan Supabase signOut di sini jika sudah terhubung
    console.log("User logged out");
    window.location.href = '/login.html';
  };

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
// TOP 25 COINS (Dummy)
// ==========================
function loadTopCoins() {
  const tableBody = document.querySelector('#topCoinsTable tbody');
  const dummyCoins = [
    { rank: 1, name: 'Bitcoin', price: '$64,200', change: '+2.5%', cap: '$1.2T' },
    { rank: 2, name: 'Ethereum', price: '$3,200', change: '-0.8%', cap: '$380B' },
    { rank: 3, name: 'Solana', price: '$145', change: '+5.2%', cap: '$60B' },
    { rank: 4, name: 'BNB', price: '$412', change: '+1.1%', cap: '$63B' },
    { rank: 5, name: 'XRP', price: '$0.72', change: '-1.5%', cap: '$38B' }
  ];

  tableBody.innerHTML = '';
  dummyCoins.forEach(coin => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${coin.rank}</td>
      <td>${coin.name}</td>
      <td>${coin.price}</td>
      <td>${coin.change}</td>
      <td>${coin.cap}</td>
    `;
    tableBody.appendChild(row);
  });
}
loadTopCoins();

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


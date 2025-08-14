// ==========================
// 1. WELCOME MESSAGE
// ==========================
function setWelcomeMessage() {
  const welcomeEl = document.getElementById('welcomeMessage');
  const username = 'Kaio'; // TODO: ambil dari Supabase kalau sudah login user
  const membership = 'Free'; // TODO: ganti 'Premium' jika user premium
  welcomeEl.textContent = `Welcome to Crypto Analyzer Pro — ${username} (${membership} Member)`;
}
setWelcomeMessage();

// ==========================
// 2. LOGOUT FUNCTION
// ==========================
function setupLogout() {
  const headerLogout = document.getElementById('logout-btn');
  const sidebarLogout = document.getElementById('sidebarLogout');
  const logoutAction = () => {
    console.log("User logged out");
    window.location.href = '/login.html';
  };
  if (headerLogout) headerLogout.addEventListener('click', logoutAction);
  if (sidebarLogout) sidebarLogout.addEventListener('click', logoutAction);
}
setupLogout();

// ==========================
// 3. MARKET FUNDAMENTALS (Dummy Data)
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
// 4. REKOMENDASI RULE
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
// 5. TOP 25 COINS LIST
// ==========================
let binanceSymbols = [];

// Ambil semua simbol dari Binance
async function fetchBinanceSymbols() {
  const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
  const data = await res.json();
  binanceSymbols = data.symbols.map(s => s.symbol);
}

// Load top coins dari CoinGecko
async function loadTopCoins() {
  await fetchBinanceSymbols();

  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd&order=market_cap_desc&per_page=25&page=1" +
    "&sparkline=false&price_change_percentage=7d"
  );
  const coins = await res.json();

  const tableBody = document.querySelector("#topCoinsTable tbody");
  tableBody.innerHTML = '';

  coins.forEach((coin, index) => {
    const shortRec = getShortTermRecommendation(coin.price_change_percentage_24h);
    const longRec = getLongTermRecommendation(coin.price_change_percentage_7d_in_currency?.usd || 0);
    const row = document.createElement('tr');
    const binanceSymbol = `${coin.symbol.toUpperCase()}USDT`;

    // Jika coin tersedia di Binance → klik ganti chart
    if (binanceSymbols.includes(binanceSymbol)) {
      row.addEventListener('click', () => {
        const chartSymbol = `BINANCE:${coin.symbol.toUpperCase()}USDT`;

        // Sinkronkan dropdown pairSelect
        const pairSelect = document.getElementById("pairSelect");
        if (pairSelect) {
          const optionExists = Array.from(pairSelect.options).some(opt => opt.value === chartSymbol);
          if (!optionExists) {
            const newOption = document.createElement("option");
            newOption.value = chartSymbol;
            newOption.textContent = `${coin.symbol.toUpperCase()}/USDT`;
            pairSelect.appendChild(newOption);
          }
          pairSelect.value = chartSymbol;
        }

        loadChart(chartSymbol);

        // Highlight row aktif
        document.querySelectorAll('#topCoinsTable tbody tr').forEach(r => r.classList.remove('active-row'));
        row.classList.add('active-row');
      });
    }

    // Isi data tabel
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><img src="${coin.image}" alt="${coin.name}" width="20" style="vertical-align:middle; margin-right:5px;"> ${coin.name} (${coin.symbol.toUpperCase()})</td>
      <td>$${coin.current_price.toLocaleString()}</td>
      <td style="color:${coin.price_change_percentage_24h >= 0 ? 'lime' : 'red'}">${coin.price_change_percentage_24h?.toFixed(2)}%</td>
      <td>$${coin.market_cap.toLocaleString()}</td>
      <td style="color:${shortRec.text === 'BUY' ? 'lime' : shortRec.text === 'SELL' ? 'red' : 'gold'}" title="${shortRec.reason}">${shortRec.text}</td>
      <td style="color:${longRec.text === 'BUY' ? 'lime' : longRec.text === 'SELL' ? 'red' : 'gold'}" title="${longRec.reason}">${longRec.text}</td>
      <td>
        ${binanceSymbols.includes(binanceSymbol)
          ? `<span style="color:lime">✔ Binance</span>`
          : `<button class="view-chart-btn" onclick="window.open('https://www.coingecko.com/en/coins/${coin.id}', '_blank')">View Chart</button>`
        }
      </td>
    `;

    tableBody.appendChild(row);
  });
}
loadTopCoins();

// ==========================
// 6. SEARCH FILTER TABEL
// ==========================
document.getElementById("coinSearch").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  document.querySelectorAll("#topCoinsTable tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(searchValue) ? "" : "none";
  });
});

// ==========================
// 7. TRADINGVIEW CHART
// ==========================
function loadChart(symbol) {
  document.getElementById("tv_chart_container").innerHTML = ""; // reset container
  new TradingView.widget({
    container_id: "tv_chart_container",
    symbol: symbol,
    interval: "60",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#000000",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
    width: "100%",
    height: "500"
  });
}
// Load chart default BTC
loadChart("BINANCE:BTCUSDT");

// Ganti chart via dropdown
document.getElementById("pairSelect").addEventListener("change", function () {
  loadChart(this.value);
});

// ==========================
// 8. LIVE CANDLESTICK CHART (Binance API)
// ==========================
let candlestickChartInstance = null;
let currentPair = 'BTCUSDT';

// Ambil data candlestick dari Binance
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

// Render candlestick chart
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

// Event listener ganti pair candlestick
document.getElementById('pairSelector').addEventListener('change', async (e) => {
  currentPair = e.target.value;
  await renderCandlestickChart(currentPair);
});

// Auto refresh candlestick tiap 60 detik
setInterval(() => {
  renderCandlestickChart(currentPair);
}, 60000);

// Load awal candlestick
renderCandlestickChart(currentPair);



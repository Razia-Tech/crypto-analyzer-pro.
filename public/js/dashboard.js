// ==========================
// LOGOUT FUNCTION
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
// MARKET FUNDAMENTALS (Dummy)
// ==========================
function loadMarketFundamentals() {
  const container = document.getElementById('market-cards');
  if (!container) return;
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
// GLOBAL SEARCH (CoinGecko)
// ==========================
const globalSearchInput = document.getElementById("globalSearch");
const searchResults = document.getElementById("searchResults");

if (globalSearchInput) {
  globalSearchInput.addEventListener("input", async function () {
    const query = this.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.style.display = "none";
      return;
    }
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
    const data = await res.json();
    searchResults.innerHTML = "";
    data.coins.forEach(coin => {
      const div = document.createElement("div");
      div.innerHTML = `<img src="${coin.thumb}" width="20"> ${coin.name} (${coin.symbol.toUpperCase()})`;
      div.addEventListener("click", () => {
        const binanceSymbol = `${coin.symbol.toUpperCase()}USDT`;
        loadChart(`BINANCE:${binanceSymbol}`);
        searchResults.style.display = "none";
        globalSearchInput.value = "";
      });
      searchResults.appendChild(div);
    });
    searchResults.style.display = "block";
  });
}

// ==========================
// TOP 25 COINS TABLE
// ==========================
let binanceSymbols = [];

// Ambil semua simbol Binance via proxy (bypass blokir)
async function fetchBinanceSymbols() {
  try {
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent("https://api.binance.com/api/v3/exchangeInfo")}`;
    const res = await fetch(url);
    const data = await res.json();
    binanceSymbols = data.symbols.map(s => s.symbol);
  } catch (err) {
    console.error("Gagal ambil data Binance:", err);
    binanceSymbols = [];
  }
}

async function loadTopCoins() {
  await fetchBinanceSymbols();
  const tableBody = document.querySelector("#topCoinsTable tbody");
  if (!tableBody) return;
  tableBody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=7d");
    const coins = await res.json();

      <tr>
        <td>${coin.symbol}</td>
        <td>$${parseFloat(coin.lastPrice).toLocaleString()}</td>
        <td style="color:${change >= 0 ? 'lime' : 'red'}">${change.toFixed(2)}%</td>
      </tr>
    `;
  });
}


    tableBody.innerHTML = '';
    coins.forEach((coin, index) => {
      const shortRec = getShortTermRecommendation(coin.price_change_percentage_24h);
      const longRec = getLongTermRecommendation(coin.price_change_percentage_7d_in_currency?.usd || 0);
      const row = document.createElement('tr');
      const binanceSymbol = `${coin.symbol.toUpperCase()}USDT`;

      if (binanceSymbols.includes(binanceSymbol)) {
        row.addEventListener('click', () => {
          const chartSymbol = `BINANCE:${binanceSymbol}`;
          loadChart(chartSymbol);
          document.querySelectorAll('#topCoinsTable tbody tr').forEach(r => r.classList.remove('active-row'));
          row.classList.add('active-row');
        });
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${coin.image}" width="20"> ${coin.name} (${coin.symbol.toUpperCase()})</td>
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

  } catch (err) {
    console.error("Error loading coins:", err);
    tableBody.innerHTML = `<tr><td colspan="8">Failed to load data</td></tr>`;
  }
}
loadTopCoins();

// ==========================
// TRADINGVIEW CHART
// ==========================
function loadChart(symbol) {
  document.getElementById("tv_chart_container").innerHTML = "";
  new TradingView.widget({
    "container_id": "tv_chart_container",
    "symbol": symbol,
    "interval": "60",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "width": "100%",
    "height": "500",
    "studies": ["RSI@tv-basicstudies", "MACD@tv-basicstudies"]
  });
}
loadChart("BINANCE:BTCUSDT");

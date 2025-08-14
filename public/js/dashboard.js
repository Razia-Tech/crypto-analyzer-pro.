document.addEventListener("DOMContentLoaded", () => {
  fetchMarketFundamentals();
  fetchTrendingCoins();
  fetchTop25Coins();
  renderCoingeckoChart();
  renderBinanceChart();

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("logoutTopBtn").addEventListener("click", logout);
});

function logout() {
  alert("Logout berhasil!");
  window.location.href = "auth.html";
}

// 1. Market Fundamentals
async function fetchMarketFundamentals() {
  const res = await fetch("https://api.coingecko.com/api/v3/global");
  const data = await res.json();
  const { total_market_cap, total_volume, market_cap_percentage } = data.data;
  document.getElementById("marketFundamentals").innerHTML = `
    🌍 Market Cap: $${total_market_cap.usd.toLocaleString()} |
    📊 24H Vol: $${total_volume.usd.toLocaleString()} |
    ₿ BTC Dominance: ${market_cap_percentage.btc.toFixed(2)}% |
    Ξ ETH Dominance: ${market_cap_percentage.eth.toFixed(2)}%
  `;
}

// 2. Trending Coins
async function fetchTrendingCoins() {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  const data = await res.json();
  const container = document.getElementById("trendingList");
  container.innerHTML = "";
  for (let coin of data.coins.slice(0, 7)) {
    let details = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.item.id}`);
    let coinData = await details.json();
    container.innerHTML += `
      <div>
        <strong>${coinData.name}</strong> - $${coinData.market_data.current_price.usd} |
        1H: ${coinData.market_data.price_change_percentage_1h_in_currency.usd?.toFixed(2) || 0}% |
        24H: ${coinData.market_data.price_change_percentage_24h.toFixed(2)}% |
        Vol 24H: $${coinData.market_data.total_volume.usd.toLocaleString()} |
        MC: $${coinData.market_data.market_cap.usd.toLocaleString()}
      </div>
    `;
  }
}

// 3. Top 25 Coins Table
async function fetchTop25Coins() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1");
  const coins = await res.json();
  const tbody = document.getElementById("topCoinsTable");
  tbody.innerHTML = "";
  coins.forEach(coin => {
    let recommendation = getRecommendation(coin.price_change_percentage_24h);
    tbody.innerHTML += `
      <tr>
        <td>${coin.name}</td>
        <td>$${coin.current_price}</td>
        <td>${coin.price_change_percentage_24h.toFixed(2)}%</td>
        <td>$${coin.total_volume.toLocaleString()}</td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td>${recommendation}</td>
      </tr>
    `;
  });
}

function getRecommendation(change24h) {
  if (change24h > 5) return "Buy (Short Term)";
  if (change24h < -5) return "Sell (Short Term)";
  return "Hold (Long Term)";
}

// 4. Coingecko Chart
async function renderCoingeckoChart() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7");
  const data = await res.json();
  const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
  const prices = data.prices.map(p => p[1]);

  new Chart(document.getElementById("coingeckoChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "BTC Price (Coingecko)", data: prices, borderColor: "blue" }]
    }
  });
}

// 5. Binance Chart
async function renderBinanceChart() {
  const res = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=7");
  const data = await res.json();
  const labels = data.map(d => new Date(d[0]).toLocaleDateString());
  const prices = data.map(d => parseFloat(d[4]));

  new Chart(document.getElementById("binanceChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "BTC Price (Binance)", data: prices, borderColor: "green" }]
    }
  });
}


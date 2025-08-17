let marketChart;

// === Format helper ===
function formatNumber(num) {
  if (!num) return "--";
  return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 2 }).format(num);
}

// === Load Market Fundamentals ===
async function loadMarketOverview() {
  const res = await fetch("https://api.coingecko.com/api/v3/global");
  const data = await res.json();
  const mkt = data.data;

  document.getElementById("btcDominance").innerText = mkt.market_cap_percentage.btc.toFixed(1) + "%";
  document.getElementById("ethDominance").innerText = mkt.market_cap_percentage.eth.toFixed(1) + "%";
  document.getElementById("marketCap").innerText = "$" + formatNumber(mkt.total_market_cap.usd);
  document.getElementById("volume24h").innerText = "$" + formatNumber(mkt.total_volume.usd);
  document.getElementById("btcSupply").innerText = formatNumber(mkt.active_cryptocurrencies);
}

// === Load Chart for coin ===
async function loadChart(coinId = "bitcoin") {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`);
  const data = await res.json();

  const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
  const prices = data.prices.map(p => p[1]);

  if (marketChart) marketChart.destroy();
  const ctx = document.getElementById("marketChart").getContext("2d");
  marketChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${coinId} Price (USD)`,
        data: prices,
        borderColor: "#f5d76e",
        backgroundColor: "rgba(245,215,110,0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "#f5d76e" } }
      },
      scales: {
        x: { ticks: { color: "#f5d76e" }, grid: { color: "#333" } },
        y: { ticks: { color: "#f5d76e" }, grid: { color: "#333" } }
      }
    }
  });
}

// === Trending Coins ===
async function loadTrending() {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  const data = await res.json();
  const tbody = document.getElementById("trendingTable");
  tbody.innerHTML = "";

  data.coins.slice(0,12).forEach(c => {
    const coin = c.item;
    const row = `
      <tr>
        <td><img src="${coin.thumb}" width="20"></td>
        <td>${coin.name}</td>
        <td>${coin.symbol.toUpperCase()}</td>
        <td>${coin.market_cap_rank}</td>
        <td><button onclick="loadChart('${coin.id}')">View</button></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// === Top 25 Coins ===
async function loadTopCoins() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1");
  const data = await res.json();
  const tbody = document.getElementById("topCoinsTable");
  tbody.innerHTML = "";

  data.forEach(c => {
    const row = `
      <tr>
        <td><img src="${c.image}" width="20"></td>
        <td>${c.name}</td>
        <td>${c.symbol.toUpperCase()}</td>
        <td>$${formatNumber(c.current_price)}</td>
        <td style="color:${c.price_change_percentage_24h>=0?'lime':'red'}">
          ${c.price_change_percentage_24h?.toFixed(2)}%
        </td>
        <td>$${formatNumber(c.market_cap)}</td>
        <td><button onclick="loadChart('${c.id}')">View</button></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// === Search Coin Chart ===
document.getElementById("searchBtn").addEventListener("click", () => {
  const coinId = document.getElementById("coinSearch").value.toLowerCase();
  if (coinId) loadChart(coinId);
});

// === Init ===
loadMarketOverview();
loadChart("bitcoin");
loadTrending();
loadTopCoins();


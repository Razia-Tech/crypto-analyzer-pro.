// dashboard.js

// Inisialisasi Supabase global
window.supaAuth = supabase.createClient(
  "https://ibzgmeooqxmbcnmovlbi.supabase.co", // Ganti dengan URL Supabase kamu
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY"             // Ganti dengan anon key Supabase kamu
);

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supaAuth;

  // Cek user login
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    alert("Silakan login dulu.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("username").textContent = session.user.email;

  document.getElementById("btn-logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });

  // Load semua fitur utama dashboard
  await loadMarketFundamentals();
  await loadOnChainAnalytics();
  await loadWalletTracker();
  await loadAICoinRating();
  await loadSmartAlerts();
});

// 1. Market Fundamentals
async function loadMarketFundamentals() {
  const container = document.getElementById("marketDataContainer");
  container.innerHTML = "Loading market data...";
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=7&page=1&sparkline=false");
    const data = await res.json();

    container.innerHTML = data.map(c => `
      <div class="card">
        <img src="${c.image}" alt="${c.name}" width="32" />
        <h3>${c.name} (${c.symbol.toUpperCase()})</h3>
        <p>Price: $${c.current_price.toLocaleString()}</p>
        <p>Market Cap: $${c.market_cap.toLocaleString()}</p>
        <p>24h Change: ${c.price_change_percentage_24h.toFixed(2)}%</p>
      </div>
    `).join("");
  } catch {
    container.innerHTML = "<p class='error'>Gagal memuat data pasar.</p>";
  }
}

// 2. On-Chain Analytics
async function loadOnChainAnalytics() {
  const whaleTracker = document.getElementById("whaleTracker");
  whaleTracker.innerHTML = "Loading whale alerts...";
  try {
    const res = await fetch("https://api.whale-alert.io/v1/transactions?api_key=demo&limit=5");
    const data = await res.json();
    whaleTracker.innerHTML = data.transactions.map(tx => `
      <p>${tx.symbol} transfer ${tx.amount} ${tx.currency} at ${new Date(tx.timestamp * 1000).toLocaleString()}</p>
    `).join("");
  } catch {
    whaleTracker.innerHTML = "<p class='error'>Gagal memuat whale alerts.</p>";
  }
}

// 3. Wallet Tracker
async function loadWalletTracker() {
  const container = document.getElementById("walletList");
  container.innerHTML = "<p>Loading wallets...</p>";

  // Dummy wallet data, nanti diganti koneksi API/DB Supabase
  const wallets = [
    { address: "0x123...abc", profit: "+$5000", lastActivity: "2h ago" },
    { address: "0x456...def", profit: "+$3200", lastActivity: "5h ago" }
  ];

  container.innerHTML = wallets.map(w => `
    <div class="card">
      <h4>${w.address}</h4>
      <p>Profit: ${w.profit}</p>
      <p>Last Activity: ${w.lastActivity}</p>
    </div>
  `).join("");
}

// 4. AI Coin Rating (Dummy)
async function loadAICoinRating() {
  const ctx = document.getElementById("aiRatingChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Bitcoin", "Ethereum", "Solana"],
      datasets: [{
        label: "AI Score",
        data: [95, 90, 85],
        backgroundColor: ["#f4c542", "#d4a017", "#ffe278"]
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// 5. Smart Alerts (Dummy)
async function loadSmartAlerts() {
  const container = document.getElementById("alertList");
  container.innerHTML = `
    <div class="card">
      <h4>BTC</h4>
      <p>Signal: BUY</p>
      <p>Reason: RSI Oversold</p>
    </div>
    <div class="card">
      <h4>ETH</h4>
      <p>Signal: SELL</p>
      <p>Reason: MACD Bearish</p>
    </div>
  `;
}

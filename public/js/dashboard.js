// dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // Cek session login
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("Anda belum login.");
    window.location.href = "auth/login.html";
    return;
  }

  document.getElementById("btnLogout").addEventListener("click", async () => {
    await signOut();
    window.location.href = "auth/login.html";
  });

  // Load modul market fundamentals
  loadMarketFundamentals();
});

async function loadMarketFundamentals() {
  const main = document.getElementById("dashboard-content");
  main.innerHTML = "<h2>Market Fundamentals</h2><p>Loading data...</p>";

  // Contoh fetch data dari CoinGecko API (gratis)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,binancecoin,solana,dogecoin,tron"
    );
    const data = await res.json();

    let html = `<table>
      <thead><tr>
        <th>Coin</th><th>Price (USD)</th><th>Market Cap</th><th>24h Change</th><th>Action</th>
      </tr></thead><tbody>`;

    data.forEach((coin) => {
      html += `<tr>
        <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td style="color:${coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}">
          ${coin.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td><button onclick="alert('Feature View for ${coin.name} coming soon!')">View</button></td>
      </tr>`;
    });

    html += "</tbody></table>";
    main.innerHTML = html;
  } catch (err) {
    main.innerHTML = "<p>Gagal mengambil data Market Fundamentals.</p>";
  }
}

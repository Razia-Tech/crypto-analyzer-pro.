document.addEventListener("DOMContentLoaded", () => {
  // Dummy user data
  document.getElementById("portfolio-value").textContent = "Rp 150,000,000";
  document.getElementById("latest-activity").textContent = "Beli BTC 0.01 @ Rp 700 juta";

  // Dummy market data
  const marketData = [
    { name: "Bitcoin", value: "Rp 700,000,000" },
    { name: "Ethereum", value: "Rp 45,000,000" },
    { name: "BNB", value: "Rp 6,000,000" },
  ];

  const marketContainer = document.getElementById("market-cards");
  marketData.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = `${item.name}: ${item.value}`;
    marketContainer.appendChild(card);
  });

  // Chart.js dummy data
  const ctx = document.getElementById("realtime-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        label: "Portfolio Value",
        data: [120, 130, 125, 140, 150, 160],
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.1)"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
});


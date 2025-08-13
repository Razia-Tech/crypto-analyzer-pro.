document.addEventListener("DOMContentLoaded", () => {
  // Dummy data user
  document.getElementById("portfolio-value").textContent = "Rp 150,000,000";
  document.getElementById("latest-activity").textContent = "Beli BTC 0.01 @ Rp 700 juta";

  // Chart dummy
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

  // Logout button handler
  document.getElementById("logout-btn").addEventListener("click", () => {
    alert("Logout...");
  });
  document.getElementById("logout-sidebar").addEventListener("click", () => {
    alert("Logout...");
  });
});

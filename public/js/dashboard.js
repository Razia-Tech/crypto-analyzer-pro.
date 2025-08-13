document.addEventListener("DOMContentLoaded", () => {
  // Dummy data user
  document.getElementById("portfolio-value").textContent = "Rp 150,000,000";
  document.getElementById("latest-activity").textContent = "Beli BTC 0.01 @ Rp 700 juta";
  <!-- Tambahkan di <head> dashboard.html -->
 
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial"></script>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial"></script>

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

async function renderCandlestickChart() {
  const ctx = document.getElementById('candlestickChart').getContext('2d');
  const chartData = await fetchCandlestickData();
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

async function renderCandlestickChart() {
  const ctx = document.getElementById('candlestickChart').getContext('2d');
  const chartData = await fetchCandlestickData();

  new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: 'BTC/USDT',
        data: chartData,
        borderColor: '#FFD700',
        color: {
          up: '#00ff99',     // candle naik
          down: '#ff3366',   // candle turun
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
        y: { ticks: { color: '#FFD700' } }
      }
    }
  });
}

renderCandlestickChart();


  new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: 'BTC/USDT',
        data: chartData,
        borderColor: '#FFD700',
        color: {
          up: '#00ff99',     // candle naik
          down: '#ff3366',   // candle turun
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
        y: { ticks: { color: '#FFD700' } }
      }
    }
  });
}

renderCandlestickChart();

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

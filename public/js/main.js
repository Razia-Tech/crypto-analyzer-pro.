// Toggle dark mode tombol
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Dummy data dan chart sudah di inline script index.html
// Jika mau tambah interaksi lain bisa ditambahkan di sini


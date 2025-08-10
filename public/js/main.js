// Tambahan script jika dibutuhkan
// Misal scroll smooth navigation atau interaksi lain
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    // Contoh smooth scroll ke section kalau satu page app
    // e.preventDefault();
    // document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

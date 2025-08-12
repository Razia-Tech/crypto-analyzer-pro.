console.log("📌 auth.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Loaded");

  const loginForm = document.getElementById("login-form");
  if (!loginForm) {
    console.error("❌ Form login tidak ditemukan!");
    return;
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("📨 Login form submitted");

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    console.log("📩 Email:", email, "| 🔑 Password:", password);

    // Login dummy
    if (email === "admin@example.com" && password === "123456") {
      console.log("✅ Login berhasil, redirect ke dashboard");
      localStorage.setItem("user", JSON.stringify({ email }));
      window.location.href = "/dashboard.html"; // Pastikan file ini ada di root
    } else {
      console.warn("❌ Email atau password salah");
      alert("Email atau password salah");
    }
  });
});



// auth.js — Versi Final
document.addEventListener("DOMContentLoaded", () => {
  // Elemen form
  const loginForm = document.getElementById("login-form");
  const magicForm = document.getElementById("magic-link-form");

  // LOGIN FORM HANDLER
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("Email dan password wajib diisi.");
        return;
      }

      try {
        // === Simulasi login ===
        // Ganti block ini dengan request API jika backend sudah siap.
        console.log("🔐 Login attempt:", email, password);
        if (email === "admin@example.com" && password === "123456") {
          localStorage.setItem("user", JSON.stringify({ email }));
          window.location.href = "/dashboard.html";
        } else {
          alert("Email atau password salah.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Terjadi kesalahan saat login.");
      }
    });
  }

  // MAGIC LINK FORM HANDLER
  if (magicForm) {
    magicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const magicEmail = document.getElementById("magic-email").value.trim();
      if (!magicEmail) {
        alert("Masukkan email untuk magic link.");
        return;
      }
      try {
        console.log("📧 Magic link sent to:", magicEmail);
        alert("Magic link telah dikirim ke " + magicEmail);
      } catch (err) {
        console.error(err);
        alert("Gagal mengirim magic link.");
      }
    });
  }

  // REGISTER PAGE HANDLER
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const regEmail = document.getElementById("reg-email").value.trim();
      const regPassword = document.getElementById("reg-password").value.trim();

      if (!regEmail || !regPassword) {
        alert("Email dan password wajib diisi.");
        return;
      }

      // Simulasi register
      localStorage.setItem("user", JSON.stringify({ email: regEmail }));
      alert("Pendaftaran berhasil. Silakan login.");
      window.location.href = "/auth/login.html";
    });
  }

  // LOGOUT HANDLER (bisa dipanggil dari dashboard)
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "/auth/login.html";
    });
  }

  // CEK LOGIN STATUS (contoh di dashboard)
  if (window.location.pathname.includes("dashboard.html")) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "/auth/login.html";
    } else {
      console.log("✅ User logged in:", user.email);
    }
  }
});


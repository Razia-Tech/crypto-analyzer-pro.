// /js/auth.js

// Ganti sesuai URL & ANON KEY dari Supabase
const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";
// Init Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Login function
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) {
    alert(error.message);
  } else {
    // Redirect setelah login sukses
    window.location.href = "/dashboard.html";
  }
}
// Event listener untuk login form
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  await loginUser(email, password);
});

  // ===== MAGIC LINK =====
  async function sendMagicLink(email) {
    try {
      if (!email) { alert("Masukkan email untuk magic link."); return; }
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/auth/verify-email.html" }
      });
      if (error) { console.error(error); alert("Gagal kirim magic link: " + error.message); return; }
      alert("Magic link terkirim. Cek email Anda.");
    } catch (err) {
      console.error("Magic link error:", err);
      alert(err.message || "Gagal mengirim magic link.");
    }
  }

  // ===== GOOGLE OAuth =====
  async function googleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard.html" }
      });
      if (error) { console.error("Google login error:", error); alert(error.message); }
      // else redirect will happen automatically by Supabase
    } catch (err) {
      console.error("Google login exception:", err);
      alert(err.message || "Google login gagal.");
    }
  }

  // ===== FORGOT PASSWORD (kirim link reset) =====
  async function sendResetEmail(email) {
    try {
      if (!email) { alert("Masukkan email."); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/auth/reset-password.html"
      });
      if (error) { console.error(error); alert("Gagal kirim link reset: " + error.message); return; }
      alert("Link reset password terkirim ke email.");
    } catch (err) {
      console.error("reset email exception:", err);
      alert(err.message || "Gagal.");
    }
  }

  // ===== RESET PASSWORD (user harus sudah membuka link reset - session active) =====
  async function updatePassword(newPassword) {
    try {
      if (!newPassword) { alert("Masukkan password baru."); return; }
      const { data, error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) { console.error(error); alert("Gagal update password: " + error.message); return; }
      alert("Password berhasil diubah. Silakan login.");
      goTo("/auth/login.html");
    } catch (err) {
      console.error("updatePassword exception:", err);
      alert(err.message || "Gagal update password.");
    }
  }

  // ===== LOGOUT =====
  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) { console.error("Logout error:", error); }
      goTo("/auth/login.html");
    } catch (err) {
      console.error("Logout exception:", err);
    }
  }

  // ===== Attach event listeners (safe) =====
  document.addEventListener("DOMContentLoaded", () => {
    // Login form (id=email, id=password)
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const email = document.getElementById("email")?.value || "";
        const password = document.getElementById("password")?.value || "";
        login(email, password);
      });
    }

    // Magic link form (id=magic-link-form and input id=magic-email)
    const magicForm = document.getElementById("magic-link-form");
    if (magicForm) {
      magicForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const email = document.getElementById("magic-email")?.value || "";
        sendMagicLink(email);
      });
    }

    // Google button (id=google-login)
    const googleBtn = document.getElementById("google-login");
    if (googleBtn) googleBtn.addEventListener("click", (e) => { e.preventDefault(); googleLogin(); });

    // Forgot password (id=forgot-form with input id=forgot-email)
    const forgotForm = document.getElementById("forgot-form");
    if (forgotForm) {
      forgotForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const email = document.getElementById("forgot-email")?.value || "";
        sendResetEmail(email);
      });
    }

    // Reset form (id=reset-form with input id=new-password)
    const resetForm = document.getElementById("reset-form");
    if (resetForm) {
      resetForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const newPass = document.getElementById("new-password")?.value || "";
        // IMPORTANT: some Supabase flows require getSessionFromUrl() first; if session not set, updateUser will fail.
        // Call getSessionFromUrl so SDK can process URL tokens (if redirected from email link)
        try {
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        } catch (err) { console.warn("getSessionFromUrl:", err); }
        updatePassword(newPass);
      });
    }

    // Optional: logout button id=logout-btn
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", (e) => { e.preventDefault(); logout(); });
  });

  // expose for debugging
  window.__supabase_client = supabase;
  window.__auth_helpers = { login, sendMagicLink, googleLogin, sendResetEmail, updatePassword, logout };
})();

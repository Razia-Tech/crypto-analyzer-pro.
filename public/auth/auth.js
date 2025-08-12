
// auth.js FINAL - Rafka Crypto Analyzer Pro
// =========================
// Ganti dengan kredensial Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Helper redirect
function goTo(page) {
  window.location.href = page;
}

// ✅ Save profile after register
async function saveProfile(userId, username) {
  const { error } = await supabaseClient
    .from("profiles")
    .upsert([{ id: userId, username }], { onConflict: "id" });
  if (error) console.error("Error saving profile:", error.message);
}

// ✅ REGISTER
async function handleRegister(email, password, username) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin + "/verify-email.html" }
  });

  if (error) return alert(error.message);
  if (data.user) await saveProfile(data.user.id, username);
  alert("Pendaftaran berhasil! Silakan cek email untuk verifikasi.");
}

// ✅ LOGIN (email/password)
async function handleLogin(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  goTo("dashboard.html");
}

// ✅ LOGIN MAGIC LINK
async function handleMagicLink(email) {
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + "/dashboard.html" }
  });
  if (error) return alert(error.message);
  alert("Magic link telah dikirim ke email.");
}

// ✅ LOGIN GOOGLE
async function handleGoogleLogin() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/dashboard.html" }
  });
  if (error) alert(error.message);
}

// ✅ FORGOT PASSWORD
async function handleForgotPassword(email) {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset.html"
  });
  if (error) return alert(error.message);
  alert("Link reset password telah dikirim ke email.");
}

// ✅ RESET PASSWORD
async function handleResetPassword(newPassword) {
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) return alert(error.message);
  alert("Password berhasil diubah. Silakan login.");
  goTo("login.html");
}

// ✅ LOGOUT
async function handleLogout() {
  await supabaseClient.auth.signOut();
  goTo("login.html");
}

// =========================
// EVENT LISTENERS (dinamis, aman dari dobel listener)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // Register
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleRegister(
        document.getElementById("reg-email").value,
        document.getElementById("reg-password").value,
        document.getElementById("reg-username").value
      );
    });
  }

  // Login normal
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleLogin(
        document.getElementById("login-email").value,
        document.getElementById("login-password").value
      );
    });
  }

  // Magic link
  const magicForm = document.getElementById("magic-form");
  if (magicForm) {
    magicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleMagicLink(document.getElementById("magic-email").value);
    });
  }

  // Google login
  const googleBtn = document.getElementById("google-login");
  if (googleBtn) {
    googleBtn.addEventListener("click", handleGoogleLogin);
  }

  // Forgot password
  const forgotForm = document.getElementById("forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleForgotPassword(document.getElementById("forgot-email").value);
    });
  }

  // Reset password
  const resetForm = document.getElementById("reset-form");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleResetPassword(document.getElementById("new-password").value);
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});



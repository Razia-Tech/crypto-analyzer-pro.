// auth.js - Supabase Auth Integration (Browser-safe, CDN style)

// Ganti dengan credential project Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";

// Pastikan Supabase tersedia
if (!window.supabase) {
  console.error("Supabase library not loaded! Pastikan script CDN sudah ada sebelum auth.js");
}

// Buat client Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== LOGIN ==========
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed: " + error.message);
  } else {
    window.location.href = "../dashboard.html";
  }
}

// ========== REGISTER ==========
async function registerUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin + "/auth/verify-email.html" }
  });

  if (error) {
    alert("Registration failed: " + error.message);
  } else {
    alert("Check your email to verify your account!");
  }
}

// ========== FORGOT PASSWORD ==========
async function forgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();

  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/auth/reset-password.html"
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
}

// ========== RESET PASSWORD ==========
async function resetPassword(event) {
  event.preventDefault();
  const password = document.getElementById("password").value.trim();

  const { data, error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password updated! You can now log in.");
    window.location.href = "./login.html";
  }
}

// ========== VERIFY EMAIL PAGE ==========
function verifyEmailPage() {
  const el = document.getElementById("verify-msg");
  if (el) {
    el.textContent = "Check your email inbox and click the verification link.";
  }
}

// Tambahkan event listener setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const forgotForm = document.getElementById("forgot-form");
  const resetForm = document.getElementById("reset-form");

  if (loginForm) loginForm.addEventListener("submit", loginUser);
  if (registerForm) registerForm.addEventListener("submit", registerUser);
  if (forgotForm) forgotForm.addEventListener("submit", forgotPassword);
  if (resetForm) resetForm.addEventListener("submit", resetPassword);
});


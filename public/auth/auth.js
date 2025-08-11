// /public/auth/auth.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co"; // ganti sesuai project kamu
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";        // ganti sesuai project kamu
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LOGIN
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Login failed: " + error.message);
  } else {
    window.location.href = "../dashboard.html";
  }
}

// REGISTER
async function registerUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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

// FORGOT PASSWORD
async function forgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;

  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/auth/reset-password.html"
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
}

// RESET PASSWORD
async function resetPassword(event) {
  event.preventDefault();
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Password updated! You can now log in.");
    window.location.href = "./login.html";
  }
}

// VERIFY EMAIL PAGE MESSAGE
async function verifyEmailPage() {
  document.getElementById("verify-msg").textContent =
    "Check your email inbox and click the verification link.";
}

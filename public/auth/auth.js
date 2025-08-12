// =========================
// Supabase Auth JS Final
// =========================

// Ganti dengan credential project Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ===== Helper: Redirect if logged in/out =====
async function checkAuth(redirectIfLoggedOut = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && redirectIfLoggedOut) {
    window.location.href = "index.html";
  }
  return session;
}

// ===== REGISTER =====
async function registerUser(e) {
  e.preventDefault();
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const username = document.getElementById("reg-username").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Check your email to verify your account!");
    window.location.href = "verify.html";
  }
}

// ===== LOGIN (Email/Password) =====
async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    window.location.href = "dashboard.html";
  }
}

// ===== LOGIN (Magic Link) =====
async function magicLinkLogin() {
  const email = document.getElementById("magic-email").value;
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) alert(error.message);
  else alert("Check your email for the magic link!");
}

// ===== LOGIN (Google) =====
async function loginGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) alert(error.message);
}

// ===== FORGOT PASSWORD =====
async function forgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById("forgot-email").value;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset.html"
  });
  if (error) alert(error.message);
  else alert("Check your email for password reset link.");
}

// ===== RESET PASSWORD =====
async function resetPassword(e) {
  e.preventDefault();
  const password = document.getElementById("reset-password").value;
  const { error } = await supabase.auth.updateUser({ password });
  if (error) alert(error.message);
  else {
    alert("Password updated!");
    window.location.href = "index.html";
  }
}

// ===== LOGOUT =====
async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// ===== LOAD DASHBOARD =====
async function loadDashboard() {
  const session = await checkAuth(true);
  const user = session.user;
  document.getElementById("user-email").innerText = user.email;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) {
    document.getElementById("user-name").innerText = profile.username || "No Username";
    document.getElementById("tier").innerText = profile.tier || "User";
  }
}

// auth.js — Crypto Analyzer Pro (FINAL)
// GANTI dengan kredensial kamu:
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Helper: ambil current page
const PAGE = window.location.pathname.split("/").pop() || "index.html";

/* =====================
   REGISTER
   ===================== */
async function registerUser(evt){
  evt && evt.preventDefault();
  const email = document.getElementById("reg-email")?.value?.trim();
  const password = document.getElementById("reg-password")?.value;
  const username = document.getElementById("reg-username")?.value?.trim();

  if(!email || !password || !username) return alert("Isi semua field");

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { username },
      emailRedirectTo: window.location.origin + "/verify.html"
    }
  });

  if(error) return alert(error.message);

  // create profile row (if not auto-created)
  if(data?.user?.id){
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        username: username
      }, { onConflict: 'id' });
    if(profErr) console.warn("profiles upsert:", profErr.message);
  }

  alert("Registrasi sukses. Cek email untuk verifikasi.");
  window.location.href = "verify.html";
}

/* =====================
   LOGIN (email + password)
   ===================== */
async function loginUser(evt){
  evt && evt.preventDefault();
  const email = document.getElementById("login-email")?.value?.trim();
  const password = document.getElementById("login-password")?.value;
  if(!email || !password) return alert("Isi email & password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) return alert(error.message);
  window.location.href = "dashboard.html";
}

/* =====================
   MAGIC LINK (email)
   ===================== */
async function magicLinkLogin(evt){
  evt && evt.preventDefault();
  const email = document.getElementById("magic-email")?.value?.trim();
  if(!email) return alert("Masukkan email");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + "/dashboard.html" }
  });

  if(error) return alert(error.message);
  alert("Magic link dikirim. Cek email.");
}

/* =====================
   OAUTH Google (butuh setup di Supabase)
   ===================== */
async function loginGoogle(){
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/dashboard.html" }
  });
  if(error) alert(error.message);
}

/* =====================
   FORGOT PASSWORD -> kirim email
   ===================== */
async function forgotPassword(evt){
  evt && evt.preventDefault();
  const email = document.getElementById("forgot-email")?.value?.trim();
  if(!email) return alert("Masukkan email");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset.html"
  });
  if(error) return alert(error.message);
  alert("Cek email untuk link reset password.");
}

/* =====================
   RESET PASSWORD (set new password)
   ===================== */
async function resetPassword(evt){
  evt && evt.preventDefault();
  const newPass = document.getElementById("reset-password")?.value;
  if(!newPass) return alert("Masukkan password baru");

  const { error } = await supabase.auth.updateUser({ password: newPass });
  if(error) return alert(error.message);
  alert("Password berhasil diubah. Silakan login.");
  window.location.href = "index.html";
}

/* =====================
   LOGOUT
   ===================== */
async function logoutUser(){
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

/* =====================
   Protect Dashboard: fetch profile and show basic info
   ===================== */
async function loadDashboard(){
  // jika tidak session -> redirect to login
  const { data: { session } } = await supabase.auth.getSession();
  if(!session) return window.location.href = "index.html";

  // tampilkan email
  const emailEl = document.getElementById("user-email");
  if(emailEl) emailEl.textContent = session.user.email || "";

  // ambil profile dari table profiles
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username,full_name,tier,avatar_url")
    .eq("id", session.user.id)
    .single();

  if(profile && !error){
    document.getElementById("user-name")?.textContent = profile.username || "";
    document.getElementById("user-fullname")?.textContent = profile.full_name || "";
    document.getElementById("tier")?.textContent = profile.tier || "User";
    const av = document.getElementById("avatar-img");
    if(av && profile.avatar_url) av.src = profile.avatar_url;
  } else {
    console.warn("profile fetch:", error?.message || "no profile");
  }
}

/* =====================
   Listen auth change — untuk handle email verify redirect otomatis
   ===================== */
supabase.auth.onAuthStateChange((event, session) => {
  // contoh: setelah verify email Supabase sering emit SIGNED_IN
  if(event === "SIGNED_IN" && PAGE === "verify.html"){
    window.location.href = "dashboard.html";
  }
});

/* =====================
   Auto-bind forms on DOMContentLoaded (if present)
   ===================== */
document.addEventListener("DOMContentLoaded", () => {
  // register
  const rf = document.getElementById("register-form");
  rf && rf.addEventListener("submit", registerUser);

  // login
  const lf = document.getElementById("login-form");
  lf && lf.addEventListener("submit", loginUser);

  // magic link
  const mf = document.getElementById("magic-form");
  mf && mf.addEventListener("submit", magicLinkLogin);

  // forgot
  const ff = document.getElementById("forgot-form");
  ff && ff.addEventListener("submit", forgotPassword);

  // reset
  const rf2 = document.getElementById("reset-form");
  rf2 && rf2.addEventListener("submit", resetPassword);

  // dashboard load
  if(PAGE === "dashboard.html") loadDashboard();
});

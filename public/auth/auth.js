// auth.js - Supabase Authentication Helper

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co"; // ganti sesuai project kamu
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";        // ganti sesuai project kamu
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login email + password
async function signInWithPassword(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}

// Login magic link
async function signInWithMagicLink(email) {
  return await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + "/dashboard.html" }
  });
}

// Register baru
async function signUp(email, password) {
  return await supabase.auth.signUp({ email, password }, {
    emailRedirectTo: window.location.origin + "/auth/verify-email.html"
  });
}

// Logout
async function signOut() {
  return await supabase.auth.signOut();
}

// Kirim reset password email
async function sendResetEmail(email) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/auth/reset-password.html"
  });
}

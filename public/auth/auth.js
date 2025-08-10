// auth.js - Supabase Authentication Helper

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co"; // ganti sesuai project kamu
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";        // ganti sesuai project kamu
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Kirim Magic Link untuk login/register
async function signInWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  return error;
}

// Register user baru dengan email & password
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password }, { emailRedirectTo: window.location.origin + '/auth/verify-email.html' });
  return { data, error };
}

// Login user dengan email & password
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Logout user
async function signOut() {
  await supabase.auth.signOut();
}

// Kirim reset password email
async function sendResetEmail(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth/reset-password.html' });
  return { data, error };
}

// Periksa user session
async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}


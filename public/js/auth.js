// public/js/auth.js
// Combined auth logic for login / register / reset-password / verify
// Replace these with your Supabase project values:
const SUPABASE_URL = 'https://ibzgmeooqxmbcnmovlbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY';

// CDN loaded <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// After that, createClient should be available:
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helpers
function qs(id) { return document.getElementById(id); }
function showMsg(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.toggle('error', isError);
  setTimeout(() => { el.classList.add('hidden'); }, 6000);
}

// Register
async function handleRegister(event) {
  event.preventDefault();
  const email = qs('register-email').value.trim();
  const password = qs('register-password').value;
  const username = qs('register-username').value.trim();
  const msgEl = qs('register-msg');

  if (!email || !password || !username) {
    showMsg(msgEl, 'Isi semua field', true);
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    }, {
      // optional: send user back to your verify page
      // redirectTo: window.location.origin + '/auth/verify.html'
    });

    if (error) throw error;

    // signUp returns user in data.user (may be null if email confirm required)
    const user = data?.user;
    // If user exists right away, create profile row
    if (user) {
      const { error: pErr } = await supabase
        .from('profiles')
        .insert([{ user_id: user.id, username }]);
      if (pErr) console.warn('Cannot insert profile yet:', pErr.message);
    }

    showMsg(msgEl, 'Registrasi berhasil. Cek email untuk verifikasi jika diminta.');
    // optionally redirect to verify page
    setTimeout(() => { window.location.href = '/auth/verify.html'; }, 1200);
  } catch (err) {
    showMsg(msgEl, err.message || 'Gagal registrasi', true);
  }
}

// Login
async function handleLogin(event) {
  event.preventDefault();
  const email = qs('login-email').value.trim();
  const password = qs('login-password').value;
  const msgEl = qs('login-msg');

  if (!email || !password) {
    showMsg(msgEl, 'Isi email dan password', true);
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });

    if (error) throw error;

    // On success redirect to dashboard
    showMsg(msgEl, 'Login berhasil. Mengalihkan...');
    setTimeout(() => window.location.href = '/dashboard.html', 800);
  } catch (err) {
    showMsg(msgEl, err.message || 'Gagal login', true);
  }
}

// Send reset password email
async function handleSendReset(event) {
  event.preventDefault();
  const email = qs('reset-email').value.trim();
  const msgEl = qs('reset-msg');

  if (!email) {
    showMsg(msgEl, 'Masukkan email', true);
    return;
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password.html'
    });
    if (error) throw error;
    showMsg(msgEl, 'Email reset password dikirim. Cek inbox/spam.');
  } catch (err) {
    showMsg(msgEl, err.message || 'Gagal kirim email reset', true);
  }
}

// Optional: Sign out function (useful on dashboard)
async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/auth/login.html';
}

// Attach handlers when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Register form
  const registerForm = document.querySelector('#register-form');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  // Login form
  const loginForm = document.querySelector('#login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Reset form
  const resetForm = document.querySelector('#reset-form');
  if (resetForm) resetForm.addEventListener('submit', handleSendReset);

  // Sign out buttons (if any)
  document.querySelectorAll('[data-signout]').forEach(btn =>
    btn.addEventListener('click', async (e) => { e.preventDefault(); await signOut(); })
  );
});

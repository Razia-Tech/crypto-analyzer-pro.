// public/js/auth.js
// Gunakan Supabase v2 via CDN
const { createClient } = supabase;
// Ganti dengan nilai dari Supabase Project
const SUPABASE_URL = 'https://ibzgmeooqxmbcnmovlbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper
function qs(id) {
  return document.getElementById(id);
}
function showMsg(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.toggle('error', isError);
  setTimeout(() => el.classList.add('hidden'), 5000);
}

// Handle Login with email/password
async function handleLogin(e) {
  e.preventDefault();
  const email = qs('login-email').value.trim();
  const password = qs('login-password').value;
  const msgEl = qs('login-msg');

  if (!email || !password) {
    showMsg(msgEl, 'Isi semua field', true);
    return;
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return showMsg(msgEl, error.message, true);

  showMsg(msgEl, 'Login berhasil, mengalihkan...');
  setTimeout(() => (window.location.href = '/dashboard.html'), 800);
}

// Handle Magic Link Login
magicLinkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('magic-email').value.trim();

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/dashboard.html'
    }
  });

  if (error) {
    alert(error.message);
  } else {
    alert('Magic link telah dikirim ke email Anda.');
  }
});
  if (error) return showMsg(msgEl, error.message, true);
  showMsg(msgEl, 'Magic link dikirim! Cek email kamu.');
}

// Handle Google Login
async function handleGoogleLogin() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard.html',
    },
  });
  if (error) alert(error.message);
}

// Sign out
async function signOut() {
  await sb.auth.signOut();
  window.location.href = '/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const magicForm = document.querySelector('#magic-link-form');
  if (magicForm) magicForm.addEventListener('submit', handleMagicLink);

  const googleBtn = document.querySelector('#google-login');
  if (googleBtn) googleBtn.addEventListener('click', handleGoogleLogin);

  document.querySelectorAll('[data-signout]').forEach((btn) =>
    btn.addEventListener('click', signOut)
  );
});

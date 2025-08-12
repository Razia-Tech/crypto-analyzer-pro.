// public/js/auth.js
// Full auth client for Crypto Analyzer Pro (Supabase JS v2 via CDN)
//
// Requirements:
//  - Put <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> BEFORE this file.
//  - Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values.
//  - Ensure Redirect URLs configured in Supabase match the redirect used here.

const { createClient } = supabase; // from CDN
const SUPABASE_URL = 'https://ibzgmeooqxmbcnmovlbi.supabase.co';         // <- GANTI
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY';               // <- GANTI

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* -------------------------
   Utility helpers
   ------------------------- */
const qs = id => document.getElementById(id);
const showMsg = (el, text, isError = false) => {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.toggle('error', !!isError);
  // keep visible for a bit
  setTimeout(() => el.classList.add('hidden'), 6000);
};

/* -------------------------
   AUTH state handling
   ------------------------- */
// Redirect to dashboard when user logs in (useful after magic link / oauth redirect)
sb.auth.onAuthStateChange((event, session) => {
  // event examples: "SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED"
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // If user is on an auth page, send to dashboard
    const path = window.location.pathname;
    if (path.includes('/auth/') || path.includes('/login.html') || path.includes('/register.html')) {
      window.location.href = '/dashboard.html';
    }
  }
});

// Some flows (magic link / oauth) redirect back with tokens in URL. Optionally call this on pages that handle redirects.
async function handleSessionFromUrl() {
  // Newer Supabase versions automatically parse the URL on load for SPA; if needed:
  try {
    // getSessionFromUrl is optional depending on SDK; if not available this call may throw
    if (typeof sb.auth.getSessionFromUrl === 'function') {
      await sb.auth.getSessionFromUrl({ storeSession: true });
    }
  } catch (err) {
    // ignore if not supported by SDK version
    console.debug('getSessionFromUrl not available or failed:', err?.message || err);
  }
}
handleSessionFromUrl();

/* -------------------------
   REGISTER
   ------------------------- */
async function handleRegister(evt) {
  evt.preventDefault();
  const username = qs('register-username')?.value?.trim();
  const email = qs('register-email')?.value?.trim();
  const password = qs('register-password')?.value;
  const msg = qs('register-msg');

  if (!username || !email || !password) {
    showMsg(msg, 'Isi semua field', true);
    return;
  }

  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password
    }, {
      // optional: redirect after email confirmation — keep root site as Site URL in Supabase
      // redirectTo: window.location.origin + '/auth/verify.html'
    });

    if (error) throw error;

    // If user created immediately (no email confirm), insert profile row
    const userId = data?.user?.id;
    if (userId) {
      // try to insert profile; ignore conflict gracefully
      const { error: pErr } = await sb.from('profiles').insert([{ user_id: userId, username }]);
      if (pErr) console.warn('profile insert error:', pErr.message || pErr);
    }

    showMsg(msg, 'Registrasi berhasil. Cek email untuk verifikasi jika diminta.');
    // redirect to verify-info page
    setTimeout(() => window.location.href = '/auth/verify.html', 1000);
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal registrasi', true);
  }
}

/* -------------------------
   LOGIN (email/password)
   ------------------------- */
async function handleLogin(evt) {
  evt.preventDefault();
  const email = qs('login-email')?.value?.trim();
  const password = qs('login-password')?.value;
  const msg = qs('login-msg');

  if (!email || !password) {
    showMsg(msg, 'Isi email dan password', true);
    return;
  }

  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    showMsg(msg, 'Login berhasil — mengalihkan...');
    setTimeout(() => window.location.href = '/dashboard.html', 700);
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal login', true);
  }
}

/* -------------------------
   MAGIC LINK (Sign-in with OTP)
   ------------------------- */
async function handleMagicLink(evt) {
  evt.preventDefault();
  const email = qs('magic-email')?.value?.trim();
  const msg = qs('login-msg') || qs('magic-msg');

  if (!email) {
    showMsg(msg, 'Masukkan email untuk magic link', true);
    return;
  }

  // Use explicit redirect to ensure Supabase knows allowed redirect
  const redirectTo = 'https://cryptoanalyzerpro.netlify.app/dashboard.html'; // <-- ensure this URL is in Supabase Redirect list

  try {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) throw error;
    showMsg(msg, 'Magic link dikirim. Cek inbox (dan folder spam).');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal kirim magic link', true);
  }
}

/* -------------------------
   GOOGLE / OAuth Sign-in
   ------------------------- */
async function handleGoogleLogin(evt) {
  evt?.preventDefault();
  const redirectTo = 'https://cryptoanalyzerpro.netlify.app/dashboard.html'; // ensure in Redirect list
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) throw error;
    // Most likely user will be redirected away to Google.
  } catch (err) {
    alert(err?.message || 'Gagal login dengan Google');
  }
}

/* -------------------------
   RESET PASSWORD (send reset email)
   ------------------------- */
async function handleSendReset(evt) {
  evt.preventDefault();
  const email = qs('reset-email')?.value?.trim();
  const msg = qs('reset-msg');
  if (!email) return showMsg(msg, 'Masukkan email', true);

  const redirectTo = 'https://cryptoanalyzerpro.netlify.app/updateuser.html'; // page where user sets new password or update profile

  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) throw error;
    showMsg(msg, 'Email reset password dikirim. Cek inbox/spam.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal kirim email reset', true);
  }
}

/* -------------------------
   CHANGE EMAIL (must be authenticated)
   ------------------------- */
async function handleChangeEmail(evt) {
  evt.preventDefault();
  const newEmail = qs('change-email')?.value?.trim();
  const msg = qs('change-msg');
  if (!newEmail) return showMsg(msg, 'Masukkan email baru', true);

  try {
    // updateUser requires authenticated session
    const { data, error } = await sb.auth.updateUser({ email: newEmail });
    if (error) throw error;
    showMsg(msg, 'Permintaan ubah email dikirim. Cek email baru untuk konfirmasi.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal update email', true);
  }
}

/* -------------------------
   CONFIRM SIGNUP / INVITE / REAUTH flows
   (these are mostly handled by Supabase via confirmation link)
   We provide helpers to call signInWithOtp for reauthentication/invite accept.
   ------------------------- */
async function sendInvite(email) {
  // invites can be implemented by sending a magic link or a specific invite endpoint
  const redirectTo = 'https://cryptoanalyzerpro.netlify.app/register.html';
  try {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err?.message || String(err) };
  }
}

async function sendReauthLink(email) {
  // reauthentication via magic link (or short-lived token)
  const redirectTo = 'https://cryptoanalyzerpro.netlify.app/updateuser.html';
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });
  if (error) throw new Error(error.message);
  return true;
}

/* -------------------------
   Sign out helper
   ------------------------- */
async function signOut() {
  await sb.auth.signOut();
  window.location.href = '/auth/login.html';
}

/* -------------------------
   Utility: show current user info on dashboard
   Usage: call populateDashboardProfile() on dashboard.html load
   ------------------------- */
async function populateDashboardProfile() {
  const user = sb.auth.getUser?.() || (await sb.auth.getSession()).data?.session?.user;
  if (!user) {
    // not logged in
    window.location.href = '/auth/login.html';
    return;
  }

  // fetch profile from 'profiles' table if exists
  const { data: profile, error } = await sb.from('profiles').select('*').eq('user_id', user.id).single();
  // fill UI elements if present
  const elName = qs('profile-username');
  const elEmail = qs('profile-email');
  if (elName && profile?.username) elName.textContent = profile.username;
  if (elEmail) elEmail.textContent = user.email;
}

/* -------------------------
   Attach event listeners on DOMContentLoaded
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Register
  const reg = qs('register-form') || qs('register-form-main') || qs('register-form-page');
  if (reg) reg.addEventListener('submit', handleRegister);

  // Login
  const loginForm = qs('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Magic link
  const magicForm = qs('magic-link-form') || qs('magic-form');
  if (magicForm) magicForm.addEventListener('submit', handleMagicLink);

  // Google login
  const googleBtn = qs('google-login');
  if (googleBtn) googleBtn.addEventListener('click', handleGoogleLogin);

  // Reset password
  const resetForm = qs('reset-form');
  if (resetForm) resetForm.addEventListener('submit', handleSendReset);

  // Change email (authenticated)
  const changeForm = qs('change-email-form') || qs('change-form');
  if (changeForm) changeForm.addEventListener('submit', handleChangeEmail);

  // Logout buttons
  document.querySelectorAll('[data-signout]').forEach(btn => {
    btn.addEventListener('click', async (e) => { e.preventDefault(); await signOut(); });
  });

  // If on dashboard page, optionally populate profile info
  if (window.location.pathname.endsWith('/dashboard.html')) {
    populateDashboardProfile().catch(err => console.debug('populate profile err', err));
  }
});

/* -------------------------
   Expose certain helpers globally if needed from HTML inline handlers
   ------------------------- */
window.CAP = {
  sb, // supabase client
  signOut,
  populateDashboardProfile,
  sendInvite,
  sendReauthLink
};


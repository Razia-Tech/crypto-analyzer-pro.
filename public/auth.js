// public/js/auth.js
const { createClient } = supabase;
const SUPABASE_URL = 'https://ibzgmeooqxmbcnmovlbi.supabase.co'; // ganti
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY'; // ganti

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- Helpers ----------
const qs = (id) => document.getElementById(id);
const showMsg = (el, txt, isErr = false) => {
  if (!el) return;
  el.textContent = txt;
  el.classList.remove('hidden');
  el.classList.toggle('error', !!isErr);
  // Jangan auto-hide untuk pesan penting
};
function parseSecondsFromError(msg) {
  if (!msg) return null;
  const m = msg.match(/after\s+(\d+)\s*seconds?/i);
  return m ? parseInt(m[1], 10) : null;
}
function setCooldown(button, key, seconds = 60) {
  if (!button) return;
  const until = Date.now() + seconds * 1000;
  localStorage.setItem(key, String(until));
  button.disabled = true;

  const tick = () => {
    const leftMs = parseInt(localStorage.getItem(key) || '0', 10) - Date.now();
    const left = Math.max(0, Math.ceil(leftMs / 1000));
    if (left > 0) {
      button.textContent = `Coba lagi dalam ${left}s`;
      requestAnimationFrame(tick);
    } else {
      localStorage.removeItem(key);
      button.disabled = false;
      button.textContent = button.dataset.restoreText || 'Kirim';
    }
  };
  tick();
}
function restoreCooldownIfAny(button, key) {
  if (!button) return;
  const until = parseInt(localStorage.getItem(key) || '0', 10);
  if (until > Date.now()) {
    const left = Math.ceil((until - Date.now()) / 1000);
    setCooldown(button, key, left);
  }
}

// ---------- Auth state & URL handling ----------
sb.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    const p = window.location.pathname;
    if (p.includes('/login.html') || p.includes('/register.html') || p.includes('/confirm-signup.html')) {
      window.location.href = `${window.location.origin}/dashboard.html`;
    }
  }
});
(async function handleSessionFromUrl() {
  try {
    if (typeof sb.auth.getSessionFromUrl === 'function') {
      await sb.auth.getSessionFromUrl({ storeSession: true });
    }
  } catch (_) {}
})();

// ---------- Register ----------
async function handleRegister(e) {
  e.preventDefault();
  const username = qs('register-username')?.value?.trim();
  const email = qs('register-email')?.value?.trim();
  const password = qs('register-password')?.value;
  const msg = qs('register-msg');
  if (!username || !email || !password) return showMsg(msg, 'Isi semua field', true);

  try {
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;

    const uid = data?.user?.id;
    if (uid) {
      const { error: pErr } = await sb.from('profiles').insert([{ user_id: uid, username }]);
      if (pErr) console.warn('profiles insert:', pErr.message);
    }
    showMsg(msg, 'Registrasi berhasil. Cek email untuk verifikasi (jika diwajibkan).');
    setTimeout(() => (window.location.href = '/confirm-signup.html'), 800);
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal registrasi', true);
  }
}

// ---------- Login (email/password) ----------
async function handleLogin(e) {
  e.preventDefault();
  const email = qs('login-email')?.value?.trim();
  const password = qs('login-password')?.value;
  const msg = qs('login-msg');
  if (!email || !password) return showMsg(msg, 'Isi email dan password', true);

  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showMsg(msg, 'Login berhasil — mengalihkan...');
    setTimeout(() => (window.location.href = '/dashboard.html'), 500);
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal login', true);
  }
}

// ---------- Magic Link (OTP via email link) + Cooldown ----------
async function handleMagicLink(e) {
  e.preventDefault();
  const email = qs('magic-email')?.value?.trim();
  const msg = qs('login-msg') || qs('magic-msg');
  const button = e.submitter || (qs('magic-link-form')?.querySelector('button'));
  if (!email) return showMsg(msg, 'Masukkan email', true);

  // Simpan label asli tombol
  if (button && !button.dataset.restoreText) button.dataset.restoreText = button.textContent;

  const cdKey = `cap_magic_${email}`;
  try {
    button && (button.disabled = true, (button.textContent = 'Mengirim...'));
    const redirectTo = 'https://cryptoanalyzerpro.netlify.app/dashboard.html';
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;

    showMsg(msg, 'Magic link terkirim. Cek inbox/spam.');
    setCooldown(button, cdKey, 60);
  } catch (err) {
    console.error('[magic-link] error:', err);
    const sec = parseSecondsFromError(err?.message) ?? 60;
    showMsg(msg, err?.message || 'Gagal kirim magic link', true);
    // Terapkan cooldown sesuai sisa detik dari error
    setCooldown(button, cdKey, sec);
  }
}

// ---------- Google OAuth (opsional; aktifkan nanti) ----------
async function handleGoogleLogin(e) {
  e?.preventDefault();
  try {
    const redirectTo = 'https://cryptoanalyzerpro.netlify.app/dashboard.html';
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
  } catch (err) {
    alert(err?.message || 'Gagal login Google');
  }
}

// ---------- Reset Password (email link) ----------
async function handleSendReset(e) {
  e.preventDefault();
  const email = qs('reset-email')?.value?.trim();
  const msg = qs('reset-msg');
  if (!email) return showMsg(msg, 'Masukkan email', true);
  try {
    const redirectTo = 'https://cryptoanalyzerpro.netlify.app/updateuser.html';
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    showMsg(msg, 'Email reset password dikirim. Cek inbox/spam.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal kirim reset password', true);
  }
}

// ---------- Change Email (butuh sesi login) ----------
async function handleChangeEmail(e) {
  e.preventDefault();
  const newEmail = qs('change-email')?.value?.trim();
  const msg = qs('change-msg');
  if (!newEmail) return showMsg(msg, 'Masukkan email baru', true);
  try {
    const { error } = await sb.auth.updateUser({ email: newEmail });
    if (error) throw error;
    showMsg(msg, 'Permintaan ubah email terkirim. Cek email baru untuk konfirmasi.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal ubah email', true);
  }
}

// ---------- Optional: OTP custom (signup/reauth/invite) via Netlify Functions ----------
// Hanya dijalankan jika elemen form-nya ada di halaman terkait.
// Kirim OTP (signup)
async function handleSendOTPRegister(e) {
  e.preventDefault();
  const email = qs('otp-email')?.value?.trim();
  const msg = qs('otp-msg');
  const btn = e.submitter;
  if (!email) return showMsg(msg, 'Masukkan email.', true);
  try {
    btn && (btn.disabled = true, btn.textContent = 'Mengirim...');
    const r = await fetch('/.netlify/functions/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'signup' })
    });
    if (!r.ok) throw new Error(await r.text());
    showMsg(msg, 'Kode terkirim. Cek email.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal kirim OTP', true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.restoreText || 'Kirim Kode (6 digit)'; }
  }
}
async function handleVerifyOTPRegister(e) {
  e.preventDefault();
  const email = qs('otp-email')?.value?.trim();
  const code = qs('otp-code')?.value?.trim();
  const username = qs('register-username')?.value?.trim();
  const regEmail = qs('register-email')?.value?.trim();
  const password = qs('register-password')?.value;
  const msg = qs('otp-msg');
  if (!email || !code) return showMsg(msg, 'Isi email & kode OTP.', true);
  if (!username || !regEmail || !password) return showMsg(msg, 'Lengkapi form pendaftaran.', true);
  if (email !== regEmail) return showMsg(msg, 'Email OTP harus sama dengan email pendaftaran.', true);
  try {
    const v = await fetch('/.netlify/functions/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, purpose: 'signup' })
    });
    if (!v.ok) throw new Error(await v.text());

    const { data, error } = await sb.auth.signUp({ email: regEmail, password });
    if (error) throw error;
    const uid = data?.user?.id;
    if (uid) await sb.from('profiles').insert([{ user_id: uid, username }]).catch(() => {});
    showMsg(msg, 'Akun dibuat. Mengalihkan ke dashboard...');
    setTimeout(() => (window.location.href = '/dashboard.html'), 700);
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal verifikasi / registrasi', true);
  }
}
// Reauth OTP
async function handleSendOTPReauth(e) {
  e.preventDefault();
  const email = qs('reauth-email')?.value?.trim();
  const msg = qs('reauth-msg');
  const btn = e.submitter;
  if (!email) return showMsg(msg, 'Masukkan email.', true);
  try {
    btn && (btn.disabled = true, btn.textContent = 'Mengirim...');
    const r = await fetch('/.netlify/functions/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'reauth' })
    });
    if (!r.ok) throw new Error(await r.text());
    showMsg(msg, 'Kode reauth terkirim. Cek email.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal kirim OTP', true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.restoreText || 'Kirim Kode Reauth'; }
  }
}
async function handleVerifyOTPReauth(e) {
  e.preventDefault();
  const email = qs('reauth-email')?.value?.trim();
  const code = qs('reauth-code')?.value?.trim();
  const msg = qs('reauth-msg');
  if (!email || !code) return showMsg(msg, 'Isi email & kode.', true);
  try {
    const v = await fetch('/.netlify/functions/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, purpose: 'reauth' })
    });
    if (!v.ok) throw new Error(await v.text());
    showMsg(msg, 'Reauth sukses. Lanjutkan aksi sensitif Anda.');
    // NOTE: set flag/logic internal bila perlu.
  } catch (err) {
    showMsg(msg, err?.message || 'Kode salah/kedaluwarsa', true);
  }
}

// Invite user (opsional, di register page)
async function handleInvite(e) {
  e.preventDefault();
  const email = qs('invite-email')?.value?.trim();
  const msg = qs('invite-msg');
  const btn = e.submitter;
  if (!email) return showMsg(msg, 'Masukkan email.', true);
  try {
    btn && (btn.disabled = true, btn.textContent = 'Mengirim...');
    const r = await fetch('/.netlify/functions/send-invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!r.ok) throw new Error(await r.text());
    showMsg(msg, 'Undangan dikirim.');
  } catch (err) {
    showMsg(msg, err?.message || 'Gagal kirim undangan', true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.restoreText || 'Kirim Undangan'; }
  }
}

// ---------- Sign out ----------
async function signOut() {
  await sb.auth.signOut();
  window.location.href = '/login.html';
}

// ---------- Dashboard profile ----------
async function populateDashboardProfile() {
  const { data } = await sb.auth.getSession();
  const user = data?.session?.user;
  if (!user) return (window.location.href = '/login.html');
  const { data: profile } = await sb.from('profiles').select('username').eq('user_id', user.id).single();
  if (qs('profile-username') && profile?.username) qs('profile-username').textContent = profile.username;
  if (qs('profile-email')) qs('profile-email').textContent = user.email || '';
}

// ---------- Wire events ----------
document.addEventListener('DOMContentLoaded', () => {
  // Register
  qs('register-form')?.addEventListener('submit', handleRegister);

  // Login
  qs('login-form')?.addEventListener('submit', handleLogin);

  // Magic link + cooldown restore
  const magicForm = qs('magic-link-form');
  if (magicForm) {
    const btn = magicForm.querySelector('button');
    if (btn) {
      btn.dataset.restoreText = btn.textContent || 'Kirim Magic Link';
      // Pulihkan cooldown berdasarkan email terakhir
      magicForm.addEventListener('input', (e) => {
        if (e.target?.id === 'magic-email') {
          const email = e.target.value.trim();
          restoreCooldownIfAny(btn, `cap_magic_${email}`);
        }
      });
    }
    magicForm.addEventListener('submit', handleMagicLink);
  }

  // Google (opsional)
  qs('google-login')?.addEventListener('click', handleGoogleLogin);

  // Reset password
  qs('reset-form')?.addEventListener('submit', handleSendReset);

  // Change email
  qs('change-email-form')?.addEventListener('submit', handleChangeEmail);

  // OTP signup (opsional)
  qs('otp-send-form')?.addEventListener('submit', handleSendOTPRegister);
  qs('otp-verify-form')?.addEventListener('submit', handleVerifyOTPRegister);

  // Reauth OTP (opsional)
  qs('reauth-send-form')?.addEventListener('submit', handleSendOTPReauth);
  qs('reauth-verify-form')?.addEventListener('submit', handleVerifyOTPReauth);

  // Invite (opsional)
  qs('invite-form')?.addEventListener('submit', handleInvite);

  // Logout buttons
  document.querySelectorAll('[data-signout]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      signOut();
    })
  );

  // Dashboard populate
  if (window.location.pathname.endsWith('/dashboard.html')) {
    populateDashboardProfile().catch(() => {});
  }
});

// ---------- Expose (optional) ----------
window.CAP = { sb, signOut, populateDashboardProfile };

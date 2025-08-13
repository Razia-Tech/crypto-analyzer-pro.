// public/js/auth.js
const { createClient } = supabase;
const SUPABASE_URL = 'https://ibzgmeooqxmbcnmovlbi.supabase.co'; // ganti
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY';              // ganti

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const qs = id => document.getElementById(id);
const showMsg = (el, txt, err=false) => {
  if(!el) return;
  el.textContent = txt;
  el.classList.remove('hidden');
  el.classList.toggle('error', err);
  setTimeout(() => el.classList.add('hidden'), 6000);
};

sb.auth.onAuthStateChange((event, session) => {
  if(event==='SIGNED_IN' || event==='TOKEN_REFRESHED'){
    if(window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')){
      window.location.href = '/dashboard.html';
    }
  }
});

async function handleSessionFromUrl(){
  if(typeof sb.auth.getSessionFromUrl==='function'){
    try { await sb.auth.getSessionFromUrl({storeSession:true}); }
    catch(e){ console.debug('getSessionFromUrl fail', e); }
  }
}
handleSessionFromUrl();

/* REGISTER */
async function handleRegister(evt){
  evt.preventDefault();
  const username = qs('register-username')?.value.trim();
  const email = qs('register-email')?.value.trim();
  const password = qs('register-password')?.value;
  const msg = qs('register-msg');

  if(!username||!email||!password){
    showMsg(msg,'Isi semua field',true);
    return;
  }
  try {
    const { data, error } = await sb.auth.signUp({email,password});
    if(error) throw error;
    if(data?.user?.id){
      const { error:pErr } = await sb.from('profiles').insert([{user_id:data.user.id, username}]);
      if(pErr) console.warn('profile insert error:', pErr.message);
    }
    showMsg(msg,'Registrasi berhasil, cek email untuk verifikasi');
    setTimeout(()=>window.location.href='/confirm-signup.html',1000);
  } catch(e){
    showMsg(msg,e.message||'Gagal registrasi',true);
  }
}

/* LOGIN EMAIL/PASSWORD */
async function handleLogin(evt){
  evt.preventDefault();
  const email = qs('login-email')?.value.trim();
  const password = qs('login-password')?.value;
  const msg = qs('login-msg');
  if(!email||!password){
    showMsg(msg,'Isi email dan password',true);
    return;
  }
  try {
    const { error } = await sb.auth.signInWithPassword({email,password});
    if(error) throw error;
    showMsg(msg,'Login berhasil, mengalihkan...');
    setTimeout(()=>window.location.href='/dashboard.html',700);
  } catch(e){
    showMsg(msg,e.message||'Gagal login',true);
  }
}

/* MAGIC LINK */
async function handleMagicLink(evt){
  evt.preventDefault();
  const emailInput = document.getElementById('magic-email');
  const msg = document.getElementById('login-msg');
  const email = (emailInput?.value || '').trim();
  if(!email){ msg?.classList.remove('hidden'); msg.textContent='Masukkan email'; return; }

  try {
    const redirectTo = 'https://cryptoanalyzerpro.netlify.app/dashboard.html';
    console.log('[magic-link] sending to', email, 'redirectTo=', redirectTo);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
    msg?.classList.remove('hidden'); msg.textContent='Magic link terkirim. Cek inbox/spam.';
  } catch (e) {
    console.error('[magic-link] error:', e);
    msg?.classList.remove('hidden'); msg.classList.add('error');
    msg.textContent = e?.message || 'Gagal kirim magic link';
  }
}

/* GOOGLE LOGIN */
async function handleGoogleLogin(evt){
  evt?.preventDefault();
  try {
    const redirectTo = 'https://cryptoanalyzerpro.netlify.app/dashboard.html';
    const { error } = await sb.auth.signInWithOAuth({
      provider:'google',
      options:{ redirectTo }
    });
    if(error) throw error;
  } catch(e){
    alert(e.message || 'Gagal login Google');
  }
}

/* RESET PASSWORD */
async function handleSendReset(evt){
  evt.preventDefault();
  const email = qs('reset-email')?.value.trim();
  const msg = qs('reset-msg');
  if(!email){
    showMsg(msg,'Masukkan email',true);
    return;
  }
  try {
    const redirectTo = 'https://cryptoanalyzerpro.netlify.app/updateuser.html';
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    if(error) throw error;
    showMsg(msg,'Email reset password terkirim, cek inbox/spam');
  } catch(e){
    showMsg(msg,e.message||'Gagal kirim reset password',true);
  }
}

/* CHANGE EMAIL */
async function handleChangeEmail(evt){
  evt.preventDefault();
  const email = qs('change-email')?.value.trim();
  const msg = qs('change-msg');
  if(!email){
    showMsg(msg,'Masukkan email baru',true);
    return;
  }
  try {
    const { error } = await sb.auth.updateUser({ email });
    if(error) throw error;
    showMsg(msg,'Permintaan ubah email terkirim, cek email baru untuk konfirmasi');
  } catch(e){
    showMsg(msg,e.message||'Gagal ubah email',true);
  }
}

/* SIGN OUT */
async function signOut(){
  await sb.auth.signOut();
  window.location.href = '/login.html';
}

/* POPULATE PROFILE DASHBOARD */
async function populateDashboardProfile(){
  const { data: session } = await sb.auth.getSession();
  const user = session?.user;
  if(!user){
    window.location.href = '/login.html';
    return;
  }
  const { data: profile } = await sb.from('profiles').select('username').eq('user_id', user.id).single();
  const nameEl = qs('profile-username');
  const emailEl = qs('profile-email');
  if(nameEl && profile?.username) nameEl.textContent = profile.username;
  if(emailEl) emailEl.textContent = user.email;
}

document.addEventListener('DOMContentLoaded', () => {
  qs('register-form')?.addEventListener('submit', handleRegister);
  qs('login-form')?.addEventListener('submit', handleLogin);
  qs('magic-link-form')?.addEventListener('submit', handleMagicLink);
  qs('google-login')?.addEventListener('click', handleGoogleLogin);
  qs('reset-form')?.addEventListener('submit', handleSendReset);
  qs('change-email-form')?.addEventListener('submit', handleChangeEmail);
  document.querySelectorAll('[data-signout]').forEach(b=>b.addEventListener('click', e=>{
    e.preventDefault(); signOut();
  }));
  if(window.location.pathname.endsWith('/dashboard.html')) populateDashboardProfile();
});

window.CAP = {
  sb,
  signOut,
  populateDashboardProfile
};


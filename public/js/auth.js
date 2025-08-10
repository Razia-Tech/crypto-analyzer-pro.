// js/auth.js
// Simple Supabase auth wrapper for client-side usage.
// Replace placeholders below with your Supabase values.

const SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT.supabase.co"; // <-- GANTI
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // <-- GANTI

// init supabase client (UMD build exposed as supabase)
const supabase = supabasejs.createClient
  ? supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) // if using UMD build name differs
  : window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// backward compatibility: if CDN exposes window.supabase
if(!window.supabase && typeof supabase !== 'undefined') window.supabase = supabase;

if (!supabase) {
  console.error('Supabase client not initialized. Please check js/auth.js placeholders.');
}

// Helper object to use in pages
const supaAuth = {
  // register
  async register(email, password) {
    if(!email || !password) return { error: new Error('Email & password diperlukan') };
    const { data, error } = await window.supabase.auth.signUp({ email, password });
    return { data, error };
  },

  // login
  async login(email, password) {
    if(!email || !password) return { error: new Error('Email & password diperlukan') };
    const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  // logout
  async logout() {
    const { error } = await window.supabase.auth.signOut();
    return { error };
  },

  // get current user
  currentUser() {
    return window.supabase.auth.getUser ? window.supabase.auth.getUser() : window.supabase.auth.user();
  },

  // simple wrapper to get session (may return Promise)
  async getSession() {
    if(window.supabase.auth.getSession) {
      const s = await window.supabase.auth.getSession();
      return s?.data?.session || null;
    } else {
      return window.supabase.auth.session ? window.supabase.auth.session() : null;
    }
  }
};

// listen auth changes (optional)
if(window.supabase && window.supabase.auth && window.supabase.auth.onAuthStateChange) {
  window.supabase.auth.onAuthStateChange((event, session) => {
    // console.log('auth event', event, session);
  });
}


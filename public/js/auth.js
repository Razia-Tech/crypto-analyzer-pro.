// js/auth.js
// Supabase client wrapper for auth flows (supabase-js v2 assumed).
// Replace the placeholders with your own Supabase project URL and anon key.

const SUPABASE_URL = 'https://ibzgmeooqxmbcnmovlbi.supabase.co'; // <-- set this
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY';           // <-- set this

// createClient from supabase-js v2 must be included via <script> or bundler.
// If you use CDN, include:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js"></script>
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
Helper functions:
- signUp(email,password)
- signIn(email,password)
- signInMagicLink(email, redirectTo)
- signOut()
- sendPasswordReset(email, redirectTo)
- handleAuthRedirect()  // for pages that Supabase redirects to (reset, verify)
*/

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/verify-email.html'
    }
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  return { data, error };
}

export async function signInMagicLink(email, redirectTo = window.location.origin + '/verify-email.html') {
  // sends magic link to email
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email, redirectTo = window.location.origin + '/reset-password.html') {
  // This uses signInWithOtp type: 'magiclink' is handled by signInWithOtp.
  // Supabase has different recommended flows for reset-password. Using signInWithOtp
  // with emailRedirectTo that leads to reset-password page is acceptable.
  const { data, error } = await supabase.auth.resetPasswordForEmail
    ? await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    : await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  return { data, error };
}

// For pages like reset-password.html and verify-email.html, handle redirect params
export async function handleAuthRedirect() {
  // This reads the URL and handles session creation automatically (supabase v2)
  // If Supabase appended 'access_token' or other params in URL, getSessionFromUrl helps.
  try {
    const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// For reset-password.html: update user password AFTER user lands with a valid session
export async function updatePassword(newPassword) {
  // Must have an active session (user logged in via recovery link)
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}


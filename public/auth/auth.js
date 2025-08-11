// /public/auth/auth.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co"; // ganti sesuai project kamu
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";        // ganti sesuai project kamu
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Cek session user
export async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session && window.location.pathname.includes('login.html')) {
    window.location.href = '/public/dashboard.html'
  }
}

// Register User
export async function handleRegister(e) {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    alert(error.message)
  } else {
    alert('Pendaftaran berhasil, cek email untuk verifikasi.')
    window.location.href = 'verify-email.html'
  }
}

// Login User
export async function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert(error.message)
  } else {
    window.location.href = '/public/dashboard.html'
  }
}

// Magic Link
export async function handleMagicLink(e) {
  e.preventDefault()
  const email = document.getElementById('email').value
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) {
    alert(error.message)
  } else {
    alert('Link login terkirim ke email.')
  }
}

// Forgot Password
export async function handleForgotPassword(e) {
  e.preventDefault()
  const email = document.getElementById('email').value
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/public/auth/reset-password.html'
  })
  if (error) {
    alert(error.message)
  } else {
    alert('Link reset password terkirim ke email.')
  }
}

// Reset Password
export async function handleResetPassword(e) {
  e.preventDefault()
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    alert(error.message)
  } else {
    alert('Password berhasil diubah.')
    window.location.href = 'login.html'
  }
}

// Logout
export async function handleLogout() {
  await supabase.auth.signOut()
  window.location.href = '/public/auth/login.html'
}

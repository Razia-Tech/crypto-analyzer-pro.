<!-- simpan di /auth.js -->
<script type="module">
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Ganti dengan credential project Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// REGISTER
export async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const username = document.getElementById("username").value.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) return alert(error.message);

  // Insert ke tabel profile
  if (data.user) {
    await supabase.from("profile").insert([
      { user_id: data.user.id, username }
    ]);
  }

  alert("Cek email untuk verifikasi!");
  window.location.href = "verify-email.html";
}

// LOGIN
export async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);

  window.location.href = "dashboard.html";
}

// FORGOT PASSWORD
export async function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password.html"
  });
  if (error) return alert(error.message);
  alert("Cek email untuk link reset password!");
}

// RESET PASSWORD
export async function handleReset(e) {
  e.preventDefault();
  const password = document.getElementById("password").value.trim();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return alert(error.message);
  alert("Password berhasil diubah!");
  window.location.href = "login.html";
}
</script>

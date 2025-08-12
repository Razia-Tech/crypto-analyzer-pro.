// Supabase init
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Login form
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "../dashboard.html";
  }
});

// Magic Link form
document.getElementById("magic-link-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("magic-email").value.trim();

  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    alert(error.message);
  } else {
    alert("Magic link telah dikirim ke email Anda!");
  }
});

// Google login
document.getElementById("google-login")?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error) alert(error.message);
});




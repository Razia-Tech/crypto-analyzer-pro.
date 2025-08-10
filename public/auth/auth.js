<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Login - Crypto Analyzer Pro</title>
<link rel="stylesheet" href="../style.css" />
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <main class="auth-container">
    <h1>Login Crypto Analyzer Pro</h1>

    <form id="loginForm">
      <label for="email">Email:</label>
      <input type="email" id="email" placeholder="email@example.com" required />
      
      <label for="password">Password:</label>
      <input type="password" id="password" placeholder="Password" required />
      
      <button type="submit">Login</button>
    </form>

    <hr />

    <h2>Atau Login dengan Magic Link</h2>
    <form id="magicLinkForm">
      <label for="magicEmail">Email:</label>
      <input type="email" id="magicEmail" placeholder="email@example.com" required />
      <button type="submit">Kirim Magic Link</button>
    </form>

    <p><a href="register.html">Daftar Baru</a> | <a href="forgot-password.html">Lupa Password?</a></p>
  </main>

  <script>
    // Ganti dengan konfigurasi project Supabase kamu
    const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";

    const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

    // Login dengan email + password
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert("Login gagal: " + error.message);
      } else {
        alert("Login berhasil!");
        window.location.href = "../dashboard.html";
      }
    });

    // Login dengan Magic Link
    const magicLinkForm = document.getElementById("magicLinkForm");
    magicLinkForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("magicEmail").value;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard.html"
        }
      });

      if (error) {
        alert("Gagal mengirim magic link: " + error.message);
      } else {
        alert("Magic link sudah dikirim ke email Anda. Cek inbox email.");
      }
    });
  </script>
</body>
</html>

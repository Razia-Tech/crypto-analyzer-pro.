// ===== Supabase Client Init =====

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co"; // ganti sesuai project kamu
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";        // ganti sesuai project kamu
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// REGISTER
async function registerUser(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: { emailRedirectTo: `${window.location.origin}/verify-email.html` }
    });
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Registrasi berhasil! Silakan cek email untuk verifikasi.");
        window.location.href = "login.html";
    }
}

// LOGIN
async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        alert("Error: " + error.message);
    } else {
        window.location.href = "dashboard.html";
    }
}

// MAGIC LINK LOGIN
async function loginMagicLink(email) {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard.html` }
    });
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Magic link terkirim! Silakan cek email.");
    }
}

// FORGOT PASSWORD
async function forgotPassword(email) {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
    });
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Email reset password terkirim!");
    }
}

// RESET PASSWORD
async function resetPassword(newPassword) {
    const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Password berhasil diubah! Silakan login kembali.");
        window.location.href = "login.html";
    }
}

// LOGOUT
async function logoutUser() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}



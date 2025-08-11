// auth.js - Supabase Auth Integration (Browser-safe, CDN style)

// Ganti dengan credential project Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";

// Inisialisasi Supabase Client via CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === LOGIN ===
async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login gagal: " + error.message);
        console.error(error);
        return;
    }

    console.log("Login sukses:", data);
    alert("Login sukses!");
    // Redirect ke dashboard atau halaman utama
    window.location.href = "/dashboard.html";
}

// === REGISTER ===
async function registerUser(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert("Registrasi gagal: " + error.message);
        console.error(error);
        return;
    }

    alert("Registrasi sukses! Silakan cek email untuk verifikasi.");
    console.log(data);
    window.location.href = "/auth/verify-email.html";
}

// === LUPA PASSWORD ===
async function forgotPassword(email) {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: "https://cryptoanalyzerpro.netlify.app/auth/reset-password.html"
    });

    if (error) {
        alert("Gagal mengirim link reset password: " + error.message);
        return;
    }

    alert("Link reset password sudah dikirim ke email!");
}

// === RESET PASSWORD ===
async function updatePassword(newPassword) {
    const { data, error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) {
        alert("Gagal mengubah password: " + error.message);
        return;
    }

    alert("Password berhasil diubah!");
    window.location.href = "/auth/login.html";
}

// Export function ke global scope
window.authFunctions = {
    loginUser,
    registerUser,
    forgotPassword,
    updatePassword
};

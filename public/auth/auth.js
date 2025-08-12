// auth.js - Supabase Auth Integration (Browser-safe, CDN style)

// Ganti dengan credential project Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";

// Inisialisasi client Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================
// LOGIN
// =============================
export async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        console.log("Login sukses:", data);
        window.location.href = "/dashboard.html";
    } catch (err) {
        alert(`Login gagal: ${err.message}`);
    }
}

// =============================
// REGISTER
// =============================
export async function registerUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        alert("Pendaftaran sukses! Periksa email untuk verifikasi.");
    } catch (err) {
        alert(`Registrasi gagal: ${err.message}`);
    }
}

// =============================
// LOGIN DENGAN MAGIC LINK
// =============================
export async function loginWithMagicLink(email) {
    try {
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        alert("Magic link terkirim! Cek email Anda.");
    } catch (err) {
        alert(`Magic link gagal: ${err.message}`);
    }
}

// =============================
// LOGIN DENGAN GOOGLE
// =============================
export async function handleGoogleLogin() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google"
        });
        if (error) throw error;
        console.log("Mengalihkan ke Google Login...");
    } catch (err) {
        alert(`Google login gagal: ${err.message}`);
    }
}

// =============================
// FORGOT PASSWORD
// =============================
export async function forgotPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password.html`
        });
        if (error) throw error;
        alert("Link reset password telah dikirim ke email.");
    } catch (err) {
        alert(`Reset password gagal: ${err.message}`);
    }
}

// =============================
// RESET PASSWORD
// =============================
export async function resetPassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        alert("Password berhasil diubah!");
        window.location.href = "/auth/login.html";
    } catch (err) {
        alert(`Gagal ubah password: ${err.message}`);
    }
}

// =============================
// LOGOUT
// =============================
export async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = "/auth/login.html";
    } catch (err) {
        alert(`Logout gagal: ${err.message}`);
    }
}

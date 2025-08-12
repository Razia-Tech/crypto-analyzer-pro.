// =========================
// Supabase Auth JS Final
// =========================

// Ganti dengan credential project Supabase kamu
const SUPABASE_URL = "https://ibzgmeooqxmbcnmovlbi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const currentPage = window.location.pathname.split("/").pop();

// =========================
// REGISTER
// =========================
async function registerUser(event) {
    event.preventDefault();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const username = document.getElementById("reg-username").value;

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin + "/verify-email.html"
        }
    });

    if (error) return alert(error.message);

    if (data.user) {
        await supabaseClient.from("profiles").insert([{
            id: data.user.id,
            username: username
        }]);
    }

    alert("Registrasi berhasil! Cek email untuk verifikasi.");
    window.location.href = "login.html";
}

// =========================
// LOGIN PASSWORD
// =========================
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) return alert(error.message);
    window.location.href = "dashboard.html";
}

// =========================
// LOGIN MAGIC LINK
// =========================
async function loginMagicLink(event) {
    event.preventDefault();
    const email = document.getElementById("magic-email").value;

    const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin + "/dashboard.html"
        }
    });

    if (error) return alert(error.message);
    alert("Magic link telah dikirim ke email.");
}

// =========================
// LOGIN GOOGLE
// =========================
async function loginGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + "/dashboard.html"
        }
    });
    if (error) alert(error.message);
}

// =========================
// FORGOT PASSWORD
// =========================
async function forgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById("forgot-email").value;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password.html"
    });

    if (error) return alert(error.message);
    alert("Link reset password telah dikirim ke email.");
}

// =========================
// RESET PASSWORD
// =========================
async function resetPassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById("new-password").value;

    const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) return alert(error.message);
    alert("Password berhasil diubah. Silakan login.");
    window.location.href = "login.html";
}

// =========================
// VERIFY EMAIL
// =========================
if (currentPage === "verify-email.html") {
    supabaseClient.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
            alert("Email berhasil diverifikasi.");
            window.location.href = "dashboard.html";
        }
    });
}

// =========================
// PROTECT DASHBOARD
// =========================
async function protectDashboard() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "login.html";
    } else {
        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single();

        if (profile) {
            document.getElementById("username-display").textContent = profile.username;
        }
    }
}

// =========================
// LOGOUT
// =========================
async function logoutUser() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}

// =========================
// Bind Events
// =========================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("register-form")) document.getElementById("register-form").addEventListener("submit", registerUser);
    if (document.getElementById("login-form")) document.getElementById("login-form").addEventListener("submit", loginUser);
    if (document.getElementById("magic-form")) document.getElementById("magic-form").addEventListener("submit", loginMagicLink);
    if (document.getElementById("forgot-form")) document.getElementById("forgot-form").addEventListener("submit", forgotPassword);
    if (document.getElementById("reset-form")) document.getElementById("reset-form").addEventListener("submit", resetPassword);
    if (currentPage === "dashboard.html") protectDashboard();
});


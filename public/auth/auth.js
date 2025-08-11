// ===== Supabase Client Init =====

const supabaseUrl = "https://ibzgmeooqxmbcnmovlbi.supabase.co"; // ganti sesuai project kamu
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliemdtZW9vcXhtYmNubW92bGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTExNTcsImV4cCI6MjA2OTg2NzE1N30.xvgi4yyKNSntsNFkB4a1YPyNs6jsQBgiCeT_XYuo9bY";        // ganti sesuai project kamu
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Auth Functions =====
async function loginWithEmail(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Login failed: " + error.message);
    } else {
        window.location.href = "/public/dashboard.html";
    }
}

async function loginWithMagicLink(email) {
    const { error } = await supabaseClient.auth.signInWithOtp({ email });
    if (error) {
        alert("Magic Link Error: " + error.message);
    } else {
        alert("Magic link sent to your email!");
    }
}

async function registerUser(email, password) {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        alert("Registration failed: " + error.message);
    } else {
        alert("Registration successful! Please check your email for verification.");
    }
}

async function forgotPassword(email) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/public/auth/reset-password.html`
    });
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Password reset email sent!");
    }
}

async function resetPassword(newPassword) {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) {
        alert("Error resetting password: " + error.message);
    } else {
        alert("Password updated! Please login again.");
        window.location.href = "/public/auth/login.html";
    }
}

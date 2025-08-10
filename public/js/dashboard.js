// dashboard.js

// Pastikan supabase client & auth global
window.supaAuth = window.supaAuth || window.supabase?.auth || null;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Dashboard loaded");

    // 🔹 Cek apakah supabase auth sudah terhubung
    if (!window.supaAuth) {
        console.warn("supaAuth not found - auth features disabled.");
    } else {
        try {
            const { data: { user } } = await window.supaAuth.getUser();
            if (!user) {
                console.log("No user session found, redirecting to login...");
                window.location.href = "/login.html";
                return;
            }
            console.log("User logged in:", user.email);
            document.querySelector("#user-email").textContent = user.email;
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    }

    // 🔹 Inisialisasi fitur dashboard
    initMarketFundamentals();
    initSentimentAnalyzer();
    initWalletTracker();
    initWhaleAlert();
    initSmartAlerts();
    // Tambahkan init fungsi lain sesuai kebutuhan
});

async function initMarketFundamentals() {
    console.log("Market Fundamentals initialized");
    // Panggil API CoinGecko dan update DOM
}

async function initSentimentAnalyzer() {
    console.log("Sentiment Analyzer initialized");
    // Panggil API sentiment dan update grafik
}

async function initWalletTracker() {
    console.log("Wallet Tracker initialized");
    // Load wallet favorit user
}

async function initWhaleAlert() {
    console.log("Whale Alert initialized");
    // Integrasi Whale Alert API
}

async function initSmartAlerts() {
    console.log("Smart Alerts initialized");
    // Cek kondisi auto trading / alert
}


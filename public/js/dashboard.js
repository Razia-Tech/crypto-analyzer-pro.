// ================== 1. AUTH CHECK SUPABASE ==================
document.addEventListener("DOMContentLoaded", async () => {
    const user = window?.supaAuth?.user();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("username").textContent = user.email || "User";
    initDashboard();
});

async function initDashboard() {
    showLoader(true);
    try {
        await loadMarketFundamentals();
        await loadOnChainAnalytics();
        await loadWalletTracker();
        await loadAICoinRating();
        await loadSmartAlerts();
        await loadSentimentAnalyzer();
        await loadRegulationFeed();
    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
    showLoader(false);
}

// Loader UI
function showLoader(show) {
    const loader = document.getElementById("globalLoader");
    if (loader) loader.style.display = show ? "block" : "none";
}

// ================== 2. MARKET FUNDAMENTALS ==================
async function loadMarketFundamentals() {
    const container = document.getElementById("marketFundamentals");
    container.innerHTML = "<p>Loading market data...</p>";
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=7&page=1&sparkline=false");
        const data = await res.json();
        container.innerHTML = data.map(c => `
            <div class="coin-card">
                <img src="${c.image}" alt="${c.name}" />
                <h3>${c.name} (${c.symbol.toUpperCase()})</h3>
                <p>Price: $${c.current_price.toLocaleString()}</p>
                <p>Market Cap: $${c.market_cap.toLocaleString()}</p>
                <p>24h: ${c.price_change_percentage_24h.toFixed(2)}%</p>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = "<p class='error'>Failed to load market data</p>";
    }
}

// ================== 3. ON-CHAIN ANALYTICS ==================
async function loadOnChainAnalytics() {
    const container = document.getElementById("onChainAnalytics");
    container.innerHTML = `
        <iframe src="https://dune.com/embeds/123456/abcdef" style="width:100%; height:400px; border:none;"></iframe>
        <div id="whaleTracker">Loading whale activity...</div>
    `;
    try {
        const whaleRes = await fetch("https://api.whale-alert.io/v1/transactions?api_key=demo&limit=5");
        const whaleData = await whaleRes.json();
        document.getElementById("whaleTracker").innerHTML =
            whaleData.transactions?.map(w => `<p>${w.symbol} → ${w.amount} ${w.currency}</p>`).join("") || "No data";
    } catch {
        document.getElementById("whaleTracker").innerHTML = "<p class='error'>Failed to load whale activity</p>";
    }
}

// ================== 4. WALLET TRACKER PRO ==================
async function loadWalletTracker() {
    const container = document.getElementById("walletTracker");
    container.innerHTML = "<p>Loading wallets...</p>";
    // Dummy data for now
    const wallets = [
        { address: "0x123...abc", profit: "+$5000", lastActivity: "2h ago" },
        { address: "0x456...def", profit: "+$3200", lastActivity: "5h ago" }
    ];
    container.innerHTML = wallets.map(w => `
        <div class="wallet-card">
            <h4>${w.address}</h4>
            <p>Profit: ${w.profit}</p>
            <p>Last Activity: ${w.lastActivity}</p>
        </div>
    `).join("");
}

// ================== 5. AI COIN RATING ==================
async function loadAICoinRating() {
    const container = document.getElementById("aiCoinRating");
    container.innerHTML = "<p>Loading AI ratings...</p>";
    // Dummy AI scoring
    const coins = [
        { name: "Bitcoin", score: 95 },
        { name: "Ethereum", score: 92 },
        { name: "Solana", score: 88 }
    ];
    container.innerHTML = coins.map(c => `
        <div class="ai-card">
            <h4>${c.name}</h4>
            <p>AI Score: ${c.score}/100</p>
        </div>
    `).join("");
}

// ================== 6. SMART ALERTS + AUTO TRADING ==================
async function loadSmartAlerts() {
    const container = document.getElementById("smartAlerts");
    container.innerHTML = "<p>Generating trading signals...</p>";
    // Placeholder logic
    const signals = [
        { coin: "BTC", action: "BUY", reason: "RSI Oversold" },
        { coin: "ETH", action: "SELL", reason: "MACD Bearish" }
    ];
    container.innerHTML = signals.map(s => `
        <div class="signal-card ${s.action.toLowerCase()}">
            <h4>${s.coin}</h4>
            <p>Signal: ${s.action}</p>
            <p>Reason: ${s.reason}</p>
        </div>
    `).join("");
}

// ================== 7. SENTIMENT ANALYZER ==================
async function loadSentimentAnalyzer() {
    const container = document.getElementById("sentimentAnalyzer");
    container.innerHTML = "<p>Analyzing market sentiment...</p>";
    // Dummy comparison
    const sentiment = { today: 72, yesterday: 65 };
    const change = sentiment.today - sentiment.yesterday;
    container.innerHTML = `
        <h4>Market Sentiment: ${sentiment.today}% (${change > 0 ? "+" : ""}${change}%)</h4>
        <p>${change > 0 ? "Positive trend" : "Negative trend"}</p>
    `;
}

// ================== 8. GLOBAL REGULATION FEED ==================
async function loadRegulationFeed() {
    const container = document.getElementById("regulationFeed");
    container.innerHTML = "<p>Loading regulation news...</p>";
    try {
        const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/");
        const data = await res.json();
        container.innerHTML = data.items.slice(0, 5).map(n => `
            <div class="news-card">
                <a href="${n.link}" target="_blank">${n.title}</a>
                <p>${n.pubDate}</p>
            </div>
        `).join("");
    } catch {
        container.innerHTML = "<p class='error'>Failed to load regulation news</p>";
    }
}

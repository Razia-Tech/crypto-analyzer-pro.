document.addEventListener("DOMContentLoaded", () => {
    fetchMarketData();
});

async function fetchMarketData() {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,ripple,solana,cardano,tron&order=market_cap_desc&per_page=7&page=1&sparkline=false"
        );
        const data = await res.json();
        renderMarketData(data);
    } catch (error) {
        console.error("Error fetching market data:", error);
        document.getElementById("market-data").innerHTML =
            `<tr><td colspan="5">Failed to load data</td></tr>`;
    }
}

function renderMarketData(coins) {
    const tbody = document.getElementById("market-data");
    tbody.innerHTML = coins.map(coin => `
        <tr>
            <td>
                <img src="${coin.image}" alt="${coin.name}" width="20">
                ${coin.name}
            </td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td style="color:${coin.price_change_percentage_24h >= 0 ? 'lightgreen' : 'red'};">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>
                <a class="view-btn" href="https://www.coingecko.com/en/coins/${coin.id}" target="_blank">View</a>
            </td>
        </tr>
    `).join("");
}

export function render(container) {
    container.innerHTML = `
        <h2>Market Fundamentals</h2>
        <div id="market-data">Fetching live data...</div>
    `;

    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd")
        .then(res => res.json())
        .then(data => {
            const html = data.slice(0, 5).map(coin => `
                <div class="coin">
                    <img src="${coin.image}" width="24">
                    ${coin.name} - $${coin.current_price}
                </div>
            `).join("");
            document.getElementById("market-data").innerHTML = html;
        })
        .catch(err => {
            document.getElementById("market-data").innerHTML = "Failed to load data.";
            console.error(err);
        });
}

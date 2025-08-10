export function render(container) {
    container.innerHTML = `
        <h2>Market Fundamentals</h2>
        <p>Menampilkan data koin dari CoinGecko...</p>
        <div id="market-data">Loading...</div>
    `;

    fetch("data/dummy/marketFundamentals.json")
        .then(res => res.json())
        .then(data => {
            const list = data.map(
                coin => `<div>${coin.name} - $${coin.price}</div>`
            ).join("");
            document.getElementById("market-data").innerHTML = list;
        })
        .catch(err => {
            document.getElementById("market-data").innerHTML = "Gagal memuat data.";
            console.error(err);
        });
}

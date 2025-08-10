async function loadMarketFundamentals() {
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
    
    try {
        const response = await fetch(apiUrl + params);
        const data = await response.json();

        const container = document.getElementById('market-data');
        container.innerHTML = '';

        data.forEach(coin => {
            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <img src="${coin.image}" width="40" height="40">
                <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
                <p>Price: $${coin.current_price.toLocaleString()}</p>
                <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}

// Jalankan otomatis saat file ini dimuat
loadMarketFundamentals();

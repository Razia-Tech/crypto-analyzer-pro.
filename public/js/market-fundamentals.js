// js/market-fundamentals.js
// Fetch top coins from CoinGecko and render cards.
// CoinGecko is public and allows client requests (but watch rate-limits).

const MarketFundamentals = (function () {

  const endpoint = 'https://api.coingecko.com/api/v3/coins/markets';
  async function fetchTopCoins(n = 7) {
    const qs = new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: String(n),
      page: '1',
      sparkline: 'false',
      price_change_percentage: '24h,7d'
    });
    const url = `${endpoint}?${qs.toString()}`;
    try {
      const res = await fetch(url);
      if(!res.ok) throw new Error('Failed to fetch CoinGecko');
      const data = await res.json();
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function formatNumber(num) {
    if(num === null || num === undefined) return '-';
    if(Math.abs(num) >= 1e9) return (num/1e9).toFixed(2) + 'B';
    if(Math.abs(num) >= 1e6) return (num/1e6).toFixed(2) + 'M';
    if(Math.abs(num) >= 1e3) return (num/1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  }

  function renderCoins(containerId, coins) {
    const el = document.getElementById(containerId);
    if(!el) return;
    el.innerHTML = '';
    if(!coins || coins.length === 0) {
      el.innerHTML = '<div class="card">No data</div>';
      return;
    }
    coins.forEach(c => {
      const card = document.createElement('div');
      card.className = 'coin-card card';
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px">
          <img src="${c.image}" alt="${c.symbol}" style="width:36px;height:36px;border-radius:6px">
          <div>
            <h4 style="margin:0">${c.name} <small style="opacity:0.7">${c.symbol.toUpperCase()}</small></h4>
            <div class="muted">Market Cap: ${formatNumber(c.market_cap)}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div>
            <div class="coin-price">$${Number(c.current_price).toLocaleString()}</div>
            <div class="muted">24h: ${c.price_change_percentage_24h_in_currency ? c.price_change_percentage_24h_in_currency.toFixed(2) + '%' : '-'}</div>
          </div>
          <div>
            <a class="btn small" href="https://www.coingecko.com/en/coins/${c.id}" target="_blank">View</a>
          </div>
        </div>
      `;
      el.appendChild(card);
    });
  }

  return {
    loadTo(containerId = 'market-list', n = 7) {
      fetchTopCoins(n).then(coins => renderCoins(containerId, coins));
    }
  };
})();


// Modul Market Fundamentals (dummy -> siap live)
const state = {
  all: [],
  filtered: [],
  page: 1,
  pageSize: 10,
  sort: { key: 'marketCap', dir: 'desc' },
  filterChange: 'all', // all | gainers | losers
  q: ''
};

// Dummy data (bisa diganti live fetch nanti)
const DUMMY = [
  { rank:1,  name:'Bitcoin',  symbol:'BTC', logo:'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',  price: 1065000000, change24h: 2.75,  marketCap: 21000000000000, volume24h: 550000000000 },
  { rank:2,  name:'Ethereum', symbol:'ETH', logo:'https://assets.coingecko.com/coins/images/279/large/ethereum.png', price: 57000000,   change24h: -1.2, marketCap: 7000000000000,  volume24h: 220000000000 },
  { rank:3,  name:'Tether',   symbol:'USDT',logo:'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png', price: 15000,  change24h: 0.0,   marketCap: 1400000000000, volume24h: 900000000000 },
  { rank:4,  name:'BNB',      symbol:'BNB', logo:'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png', price: 9600000, change24h: 0.8, marketCap: 1500000000000, volume24h: 130000000000 },
  { rank:5,  name:'Solana',   symbol:'SOL', logo:'https://assets.coingecko.com/coins/images/4128/large/solana.png', price: 2100000, change24h: 6.1, marketCap: 980000000000, volume24h: 180000000000 },
  { rank:6,  name:'XRP',      symbol:'XRP', logo:'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', price: 9800, change24h: -0.7, marketCap: 730000000000, volume24h: 95000000000 },
  { rank:7,  name:'Cardano',  symbol:'ADA', logo:'https://assets.coingecko.com/coins/images/975/large/cardano.png', price: 5400, change24h: 1.2, marketCap: 520000000000, volume24h: 40000000000 },
  { rank:8,  name:'Dogecoin', symbol:'DOGE',logo:'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', price: 2200, change24h: -3.4, marketCap: 450000000000, volume24h: 65000000000 },
  { rank:9,  name:'TRON',     symbol:'TRX', logo:'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png', price: 1800, change24h: 0.6, marketCap: 380000000000, volume24h: 48000000000 },
  { rank:10, name:'Toncoin',  symbol:'TON', logo:'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png', price: 120000, change24h: 4.8, marketCap: 360000000000, volume24h: 30000000000 },
  { rank:11, name:'Polkadot', symbol:'DOT', logo:'https://assets.coingecko.com/coins/images/12171/large/polkadot.png', price: 84000, change24h: 2.1, marketCap: 290000000000, volume24h: 18000000000 },
  { rank:12, name:'Litecoin', symbol:'LTC', logo:'https://assets.coingecko.com/coins/images/2/large/litecoin.png', price: 1200000, change24h: -0.4, marketCap: 220000000000, volume24h: 11000000000 },
];

const el = {
  navItems: document.querySelectorAll('.cap-nav__item[data-target]'),
  sections: document.querySelectorAll('.cap-section'),
  mfSearch: document.getElementById('mf-search'),
  mfChangeFilter: document.getElementById('mf-change-filter'),
  mfSort: document.getElementById('mf-sort'),
  mfTbody: document.getElementById('mf-tbody'),
  mfPagination: document.getElementById('mf-pagination'),
  sidebarLogout: document.getElementById('sidebar-logout'),
  btnLogout: document.getElementById('btn-logout'),
  globalSearch: document.getElementById('global-search'),
};

// ---- NAV HANDLERS
el.navItems.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = a.dataset.target;
    // toggle active
    document.querySelectorAll('.cap-nav__item').forEach(n => n.classList.remove('is-active'));
    a.classList.add('is-active');
    // toggle section
    el.sections.forEach(s => s.classList.remove('is-visible'));
    document.getElementById(target).classList.add('is-visible');
  });
});

// ---- LOGOUT (stub; sambungkan ke Supabase kalau siap)
[el.sidebarLogout, el.btnLogout].forEach(btn => {
  if (btn) btn.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: supabase.auth.signOut() lalu redirect
    alert('Logout (dummy). Sambungkan ke Supabase auth saat live.');
  });
});

// ---- MARKET FUNDAMENTALS
function initMarket() {
  state.all = DUMMY.slice();
  applyFilters();
  bindControls();
}

function bindControls() {
  el.mfSearch.addEventListener('input', (e) => {
    state.q = e.target.value.trim().toLowerCase();
    state.page = 1;
    applyFilters();
  });

  el.mfChangeFilter.addEventListener('change', (e) => {
    state.filterChange = e.target.value;
    state.page = 1;
    applyFilters();
  });

  el.mfSort.addEventListener('change', (e) => {
    const [key, dir] = e.target.value.split(':');
    state.sort = { key, dir };
    state.page = 1;
    applyFilters();
  });
}

function applyFilters() {
  // filter by query
  let arr = state.all.filter(row => {
    if (!state.q) return true;
    return row.name.toLowerCase().includes(state.q) || row.symbol.toLowerCase().includes(state.q);
  });

  // filter by change
  if (state.filterChange === 'gainers') arr = arr.filter(r => r.change24h > 0);
  if (state.filterChange === 'losers')  arr = arr.filter(r => r.change24h < 0);

  // sort
  arr.sort((a,b) => {
    const k = state.sort.key;
    const dir = state.sort.dir === 'asc' ? 1 : -1;
    return (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir;
  });

  state.filtered = arr;
  renderTable();
  renderPagination();
}

function renderTable() {
  const start = (state.page - 1) * state.pageSize;
  const rows = state.filtered.slice(start, start + state.pageSize);

  el.mfTbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.rank}</td>
      <td>
        <div class="mf-row__name">
          <img src="${r.logo}" alt="${r.symbol}" class="mf-row__logo"/>
          <span>${r.name} (${r.symbol})</span>
        </div>
      </td>
      <td>Rp ${formatIDR(r.price)}</td>
      <td class="${r.change24h >= 0 ? 'up' : 'down'}">${r.change24h.toFixed(2)}%</td>
      <td>Rp ${formatIDR(r.marketCap)}</td>
      <td>Rp ${formatIDR(r.volume24h)}</td>
    </tr>
  `).join('');
}

function renderPagination() {
  const pages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  let html = '';

  const addBtn = (p, label = p) => {
    html += `<button data-page="${p}" class="${p === state.page ? 'is-active' : ''}">${label}</button>`;
  };

  addBtn(Math.max(1, state.page - 1), '‹');
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
      addBtn(i);
    } else if (i === 2 && state.page > 3) {
      html += `<span style="opacity:.5; padding:6px">...</span>`;
    } else if (i === pages - 1 && state.page < pages - 2) {
      html += `<span style="opacity:.5; padding:6px">...</span>`;
    }
  }
  addBtn(Math.min(pages, state.page + 1), '›');

  el.mfPagination.innerHTML = html;
  el.mfPagination.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page, 10);
      renderTable();
      renderPagination();
    });
  });
}

function formatIDR(n){
  try { return Number(n).toLocaleString('id-ID'); }
  catch { return n; }
}

// ---- Global search (contoh hook)
if (el.globalSearch) {
  el.globalSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // arahkan ke Market Fundamentals dan apply query
      document.querySelector('.cap-nav__item[data-target="section-market-fundamentals"]').click();
      el.mfSearch.value = e.target.value;
      state.q = e.target.value.trim().toLowerCase();
      state.page = 1;
      applyFilters();
    }
  });
}

// Inisialisasi default
initMarket();

/* ===========================================
   CATATAN: Persiapan ke data LIVE
   -------------------------------------------
   1) Ambil data dari API eksternal (misal CoinGecko):
      async function fetchLive() {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        const json = await res.json();
        state.all = json.map((c, i) => ({
          rank: c.market_cap_rank || (i+1),
          name: c.name,
          symbol: c.symbol.toUpperCase(),
          logo: c.image,
          price: c.current_price,
          change24h: c.price_change_percentage_24h || 0,
          marketCap: c.market_cap,
          volume24h: c.total_volume
        }));
        applyFilters();
      }

      // panggil:
      // fetchLive();

   2) Integrasi Supabase (opsional):
      - Simpan watchlist user, preferensi sort/filter.
      - Proteksi route: cek session lalu render dashboard.
   =========================================== */

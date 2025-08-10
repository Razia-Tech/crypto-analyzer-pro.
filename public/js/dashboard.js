// js/dashboard.js
// Basic dashboard wiring: auth check + market fundamentals load

(async function(){
  // ensure supaAuth exists
  if(!window.supaAuth) {
    console.warn('supaAuth not found - auth features disabled.');
  } else {
    // show user info if logged in
    try {
      const session = await supaAuth.getSession();
      let user = null;
      if(session && session.user) user = session.user;
      else if(window.supabase && window.supabase.auth && window.supabase.auth.user) user = window.supabase.auth.user();
      if(user) {
        document.getElementById('user-email').textContent = user.email;
      } else {
        // not logged in -> optionally redirect to login
        // window.location.href = 'login.html';
      }
    } catch(e) {
      console.warn('Could not get session', e);
    }
  }

  // Logout button
  const btnLogout = document.getElementById('btn-logout');
  if(btnLogout) btnLogout.addEventListener('click', async () => {
    if(window.supaAuth) {
      await supaAuth.logout();
    }
    window.location.href = 'index.html';
  });

  // Load market fundamentals
  if(window.MarketFundamentals) {
    MarketFundamentals.loadTo('market-list', 7);
  }

  // sentiment refresh (simple simulation)
  const btnSent = document.getElementById('btn-refresh-sentiment');
  if(btnSent){
    btnSent.addEventListener('click', async () => {
      btnSent.disabled = true;
      btnSent.textContent = 'Refreshing...';
      // For live: call server-side job to compute sentiment.
      // For now: simple placeholder demo using CoinGecko top 7 as "sentiment"
      try {
        await MarketFundamentals.loadTo('market-list', 7);
        const out = document.getElementById('sentiment-output');
        out.innerHTML = '<div class="card">Sentiment updated (demo). For production, run server-side job every 3 hours.</div>';
      } catch(e) {
        console.error(e);
      } finally {
        btnSent.disabled = false;
        btnSent.textContent = 'Refresh Sentiment';
      }
    });
  }
})();


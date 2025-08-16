async function loadCoinGeckoCandlesInto(containerId, coinId="bitcoin") {
  try {
    const url = `/api/coingecko-proxy?url=${encodeURIComponent(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    console.log("CoinGecko chart data:", data);

    // render chart di containerId ...
  } catch (err) {
    console.error("CoinGecko chart error", err);
  }
}


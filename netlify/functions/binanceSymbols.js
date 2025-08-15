import fetch from 'node-fetch';

export async function handler() {
  try {
    // Gunakan proxy gratis untuk bypass blokir Binance (HTTP 451)
    const proxyUrl = "https://api.allorigins.win/raw?url=" +
      encodeURIComponent("https://api.binance.com/api/v3/exchangeInfo");

    const res = await fetch(proxyUrl);
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Binance API error: ${res.status}` })
      };
    }

    const data = await res.json();
    const symbols = data.symbols?.map(s => s.symbol) || [];

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ symbols })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}





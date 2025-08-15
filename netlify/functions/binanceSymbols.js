export async function handler() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/exchangeInfo", {
      headers: {
        "X-MBX-APIKEY": process.env.BINANCE_API_KEY // Set di Netlify
      }
    });

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


export async function handler() {
  try {
    // Proxy publik
    const proxyUrl = "https://corsproxy.io/?";
    const targetUrl = "https://api.binance.com/api/v3/exchangeInfo";

    const res = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
      headers: {
        "X-MBX-APIKEY": process.env.BINANCE_API_KEY || ""
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


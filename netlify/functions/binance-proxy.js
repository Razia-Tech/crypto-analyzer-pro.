export async function handler(event, context) {
  try {
    const symbol = event.queryStringParameters.symbol || "BTCUSDT";
    const interval = event.queryStringParameters.interval || "1h";
    const limit = event.queryStringParameters.limit || "100";

    // URL Binance API
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Binance API error: ${res.status}` })
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // penting untuk frontend
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}


export async function handler(event, context) {
  try {
    const symbol = event.queryStringParameters.symbol || "BTCUSDT";
    const interval = event.queryStringParameters.interval || "1h";
    const limit = event.queryStringParameters.limit || "100";

    // arahkan request ke Cloudflare Worker, bukan langsung Binance
    const url = `https://binance-proxy.kaiosiddik.workers.dev/?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Worker error: ${res.status}` })
      };
    }

    const data = await res.text(); // Worker balikin JSON mentah

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: data
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}



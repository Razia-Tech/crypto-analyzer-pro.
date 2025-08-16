export async function handler(event) {
  try {
    const symbol = event.queryStringParameters.symbol || "BTCUSDT";
    const interval = event.queryStringParameters.interval || "1h";
    const limit = event.queryStringParameters.limit || "100";

    // arahkan ke Cloudflare Worker
    const workerUrl = `https://binance-proxy.kaiosiddik.workers.dev/?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(workerUrl); // pakai fetch native Netlify
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Worker error: ${res.status}` })
      };
    }

    const data = await res.text(); // Binance balikin array JSON
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: data
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
}


import fetch from "node-fetch";

export async function handler(event) {
  try {
    const symbol = event.queryStringParameters.symbol || "BTCUSDT";
    const interval = event.queryStringParameters.interval || "1h";
    const limit = event.queryStringParameters.limit || "100";

    // Cloudflare Worker endpoint (ganti sesuai worker kamu)
    const workerUrl = `https://binance-proxy.kaiosiddik.workers.dev/?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(workerUrl);
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Worker error: ${res.status}` })
      };
    }

    const data = await res.text(); // Binance return array, bukan JSON object
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

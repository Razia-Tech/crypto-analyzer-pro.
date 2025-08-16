import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const symbol = event.queryStringParameters.symbol || "BTCUSDT";
    const interval = event.queryStringParameters.interval || "1h";
    const limit = event.queryStringParameters.limit || "100";

    // Proxy ke Cloudflare Worker kamu agar tidak kena error 451
    const proxyUrl = `https://binance-proxy.kaiosiddik.workers.dev/?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    const res = await fetch(proxyUrl);

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Proxy error: ${res.status}` })
      };
    }

    const data = await res.text();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: data
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

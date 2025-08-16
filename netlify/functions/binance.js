import fetch from "node-fetch";

export async function handler(event) {
  try {
    const symbol = event.queryStringParameters.symbol || "BTCUSDT";
    const interval = event.queryStringParameters.interval || "1h";
    const limit = event.queryStringParameters.limit || "100";

    const url = `https://cryptoanalyzerpro.netlify.app/.netlify/functions/binance?symbol=BTCUSDT&interval=1h&limit=100}`;
    const res = await fetch(url);

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `Binance API error ${res.status}` })
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
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
}

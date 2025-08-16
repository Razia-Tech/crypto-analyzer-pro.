// netlify/functions/binance.js
import fetch from "node-fetch";

export async function handler(event) {
  const { symbol = "BTCUSDT", interval = "1h", limit = 100 } = event.queryStringParameters;
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const res = await fetch(url, {
      headers: { "X-MBX-APIKEY": process.env.BINANCE_API_KEY }
    });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

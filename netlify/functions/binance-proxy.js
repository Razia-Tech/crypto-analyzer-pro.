// netlify/functions/binance-proxy.js
import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { symbol = "BTCUSDT", interval = "1h", limit = 100 } =
      event.queryStringParameters;

    // Fallback endpoints
    const endpoints = [
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      `https://api1.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    ];

    let response;
    for (const url of endpoints) {
      try {
        response = await fetch(url);
        if (response.ok) {
          break;
        } else {
          console.warn(`Binance endpoint failed: ${url} -> ${response.status}`);
        }
      } catch (err) {
        console.warn(`Binance endpoint error: ${url} -> ${err.message}`);
      }
    }

    if (!response || !response.ok) {
      return {
        statusCode: response ? response.status : 502,
        body: JSON.stringify({
          error: `Binance API error: ${
            response ? response.status : "No response"
          }`,
        }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}


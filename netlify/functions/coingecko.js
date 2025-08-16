import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { path } = event.queryStringParameters;
    if (!path) {
      return { statusCode: 400, body: "Missing path param" };
    }

    const url = `https://api.coingecko.com/api/v3/${path}`;
    const res = await fetch(url);
    const text = await res.text();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  }
}

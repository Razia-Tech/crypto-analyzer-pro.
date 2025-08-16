export async function handler(event, context) {
  try {
    const { url } = event.queryStringParameters;
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing url param" }) };
    }

    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `CoinGecko API error: ${res.status}` }),
      };
    }

    const data = await res.text();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: data,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

export async function handler() {
  try {
    const apiKey = process.env.BINANCE_API_KEY; // Ambil dari env Netlify
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo', {
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });
    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

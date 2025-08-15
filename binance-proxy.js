export default {
  async fetch(request, env) {
    const url = "https://api.binance.com/api/v3/exchangeInfo";
    const res = await fetch(url, {
      headers: {
        "X-MBX-APIKEY": env.BINANCE_API_KEY
      }
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  }
};

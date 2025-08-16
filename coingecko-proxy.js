export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const targetUrl = searchParams.get("url");

      if (!targetUrl) {
        return new Response(JSON.stringify({ error: "Missing ?url= param" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Forward request ke CoinGecko
      const response = await fetch(targetUrl, {
        headers: { "accept": "application/json" },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `CoinGecko error ${response.status}` }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.text();
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",  // fix CORS
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Proxy error", details: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

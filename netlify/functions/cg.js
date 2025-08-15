// netlify/functions/cg.js
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
};

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS };
  }
  try {
    const suffix = (event.path || "").replace(/^\/\.netlify\/functions\/cg/, "") || "/";
    const qs = event.rawQuery ? `?${event.rawQuery}` : "";
    const url = `https://api.coingecko.com${suffix}${qs}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "CryptoAnalyzerPro/1.0 (+netlify)",
        "Accept": "application/json"
      }
    });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json; charset=utf-8";
    return {
      statusCode: res.status,
      headers: { ...CORS, "Content-Type": contentType },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Upstream fetch failed", detail: String(err) })
    };
  }
};

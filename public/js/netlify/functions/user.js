// netlify/functions/user.js
export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ""
    };
  }

  const auth = event.headers.authorization || event.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return json(401, { error: "Missing Authorization Bearer token" });
  }
  const jwt = auth.replace("Bearer ", "").trim();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1) Verifikasi user via Supabase Auth
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${jwt}`
      }
    });
    if (!userRes.ok) {
      const txt = await userRes.text();
      return json(userRes.status, { error: "Auth verify failed", detail: txt });
    }
    const user = await userRes.json(); // { id, email, ... }

    // 2) Ambil profil dari tabel "profiles" (opsional, kalau tabel ada)
    //    Pastikan kamu punya table `profiles` dengan kolom:
    //    id (uuid, pk) = auth.users.id
    //    full_name (text), membership_status (text), last_login_at (timestamptz)
    const profRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,membership_status,last_login_at&id=eq.${user.id}`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      }
    );

    let profile = null;
    if (profRes.ok) {
      const arr = await profRes.json();
      profile = arr?.[0] || null;
    }

    // Fallback jika profiles kosong
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || null,
        membership_status: profile?.membership_status || "Free",
        last_login_at: profile?.last_login_at || null
      }
    };

    // 3) Update last_login_at (opsional)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({ last_login_at: new Date().toISOString() })
      });
    } catch (_) {}

    return json(200, payload);
  } catch (err) {
    return json(500, { error: "Internal error", detail: err.message });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Allow-Methods": "GET,OPTIONS"
  };
}
function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(body)
  };
}


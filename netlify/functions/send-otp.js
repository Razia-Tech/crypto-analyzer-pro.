export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { email } = JSON.parse(event.body || "{}");
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Email wajib diisi" }) };
  }

  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_ANON_KEY",
        "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ email, create_user: true })
    });

    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data.message || "Gagal mengirim OTP" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: "OTP terkirim", data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}


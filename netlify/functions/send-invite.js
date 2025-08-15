export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { email } = JSON.parse(event.body || "{}");
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Email wajib diisi" }) };
  }

  // Kirim undangan via email (contoh langsung return sukses)
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Undangan dikirim ke ${email}` })
  };
}


const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) return { statusCode: 400, body: 'Email is required' };

    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Crypto Analyzer Pro</h2>
        <p>Anda diundang untuk mendaftar.</p>
        <p><a href="https://cryptoanalyzerpro.netlify.app/register.html">Daftar Sekarang</a></p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Undangan Bergabung',
        html
      })
    });

    if (!resp.ok) return { statusCode: 502, body: 'Failed to send invite' };

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch(e){
    console.error('send-invite error', e);
    return { statusCode: 500, body: 'Internal Error' };
  }
};

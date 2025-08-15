// Netlify Function: send-otp
// Menghasilkan 6-digit code, simpan ke table 'otps', dan kirim email via Resend.
// ENV yang dibutuhkan di Netlify:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY
//   MAIL_FROM  (mis. "Crypto Analyzer Pro <no-reply@yourdomain.com>")

const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { email, purpose } = JSON.parse(event.body || '{}');
    if (!email || !['signup','reauth'].includes(purpose)) {
      return { statusCode: 400, body: 'Invalid payload' };
    }

    const code = String(Math.floor(100000 + Math.random()*900000)); // 6-digit

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: insErr } = await supabase.from('otps').insert([{ email, code, purpose }]);
    if (insErr) {
      console.error('insert otp error', insErr);
      return { statusCode: 500, body: 'Failed to save OTP' };
    }

    // Kirim email via Resend
    const html = `
      <div style="font-family:Arial,sans-serif">
        <h2>Crypto Analyzer Pro</h2>
        <p>Kode verifikasi Anda:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>
        <p>Kode berlaku 10 menit. Jika Anda tidak meminta ini, abaikan email ini.</p>
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
        subject: purpose === 'signup' ? 'Kode Verifikasi Pendaftaran' : 'Kode Reauthentication',
        html
      })
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('resend error:', t);
      return { statusCode: 502, body: 'Failed to send email' };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('send-otp error', e);
    return { statusCode: 500, body: 'Internal Error' };
  }
};

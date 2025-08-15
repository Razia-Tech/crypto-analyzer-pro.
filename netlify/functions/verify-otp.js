// Netlify Function: verify-otp
// Memverifikasi kode masih valid & belum digunakan, lalu menandai 'used_at'.
// Payload: { email, code, purpose }

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { email, code, purpose } = JSON.parse(event.body || '{}');
    if (!email || !code || !['signup','reauth'].includes(purpose)) {
      return { statusCode: 400, body: 'Invalid payload' };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: rows, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', purpose)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('select otp error', error);
      return { statusCode: 500, body: 'DB error' };
    }

    const otp = rows?.[0];
    if (!otp) return { statusCode: 400, body: 'Kode tidak valid' };

    const now = new Date();
    const exp = new Date(otp.expires_at);
    if (now > exp) return { statusCode: 400, body: 'Kode kedaluwarsa' };

    const { error: updErr } = await supabase
      .from('otps')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otp.id);
    if (updErr) {
      console.error('update used_at error', updErr);
      return { statusCode: 500, body: 'Failed to mark used' };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('verify-otp error', e);
    return { statusCode: 500, body: 'Internal Error' };
  }
};

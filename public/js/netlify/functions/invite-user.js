import { createClient } from '@supabase/supabase-js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email wajib diisi' })
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Invite user
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Undangan terkirim', data })
  };
}

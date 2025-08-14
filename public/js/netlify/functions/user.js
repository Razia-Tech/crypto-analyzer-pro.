// netlify/functions/user.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // gunakan SERVICE ROLE untuk akses server-side
);

export async function handler(event) {
  try {
    // Ambil user_id dari query string
    const { user_id } = event.queryStringParameters;

    if (!user_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "user_id diperlukan" }),
      };
    }

    // Ambil data user dari tabel profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, membership_status, created_at")
      .eq("id", user_id)
      .single();

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

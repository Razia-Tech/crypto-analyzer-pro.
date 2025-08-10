# Crypto Analyzer Pro - Starter (Live-ready)

Template ini berisi file minimal namun *live-ready*:
- Supabase auth (email/password) — `js/auth.js`
- Market Fundamentals (CoinGecko) — `js/market-fundamentals.js`
- Dashboard + pages (index, login, register, dashboard)
- Styling gold/black theme

## Cara pakai singkat
1. Buat project Supabase → catat `SUPABASE_URL` dan `anon key`.
2. Edit `js/auth.js` → ganti:
   - `SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"`
   - `SUPABASE_ANON_KEY = "YOUR_ANON_KEY"`
3. Upload semua file ke GitHub repo.
4. Hubungkan repo ke Netlify (Import from Git):
   - Build command: ``
   - Publish directory: `.` (atau `public/` jika kamu gunakan folder public)
   - Tambahkan env vars di Netlify jika perlu.
5. Buka site Netlify → halaman index / dashboard.

## Note penting
- Untuk fitur Sentiment & ML/Auto-trading: butuh backend (serverless) & scheduler. Di template ini saya berikan kerangka frontend & market fundamentals.
- JANGAN simpan service_role key di client. Hanya gunakan anon key untuk auth & public read.

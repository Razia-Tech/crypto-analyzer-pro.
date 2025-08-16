# 🚀 Crypto Analyzer Pro

Dashboard analisis crypto dengan integrasi:
- Binance API (via Cloudflare Worker Proxy)
- CoinGecko
- Supabase Auth
- Netlify Hosting

## Struktur Project
- `public/` → frontend (HTML, CSS, JS)
- `netlify/functions/` → serverless API (proxy Binance, Coingecko)
- `netlify.toml` → config untuk routing Netlify

## Deploy
1. Hubungkan repo ke Netlify
2. Cloudflare Worker untuk Binance Proxy
3. Supabase untuk login/signup

async function fetchBinanceSymbols() {
  try {
    const res = await fetch("/.netlify/functions/binanceSymbols");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    binanceSymbols = data.symbols?.map(s => s.symbol) || [];
  } catch (err) {
    console.error("Gagal ambil data Binance:", err);
    binanceSymbols = [];
  }
}

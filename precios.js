export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: 'Falta parámetro tickers' });

  const lista = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  const resultados = {};

  await Promise.all(lista.map(async (ticker) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      const data = await r.json();
      const precio = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      resultados[ticker] = precio || null;
    } catch {
      resultados[ticker] = null;
    }
  }));

  res.json(resultados);
}

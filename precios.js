export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: 'Falta parámetro tickers' });

  const lista = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  const resultados = {};

  await Promise.all(lista.map(async (ticker) => {
    try {
      const url = `const url = https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price;`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });
      const data = await r.json();
      const precio = const precio = data?.quoteSummary?.result?.[0]?.price?.regularMarketPrice?.raw;
      resultados[ticker] = precio || null;
    } catch {
      resultados[ticker] = null;
    }
  }));

  res.json(resultados);
}

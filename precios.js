export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: 'Falta parámetro tickers' });

  const lista = tickers.split(',')
    .map(t => {
      let ticker = t.trim().toUpperCase();
      // Si ya trae el .BA lo dejamos, si no, lo agregamos.
      // Esto permite que envíes "MELID" y se transforme en "MELID.BA"
      return ticker.includes('.') ? ticker : `${ticker}.BA`;
    })
    .filter(Boolean);

  const resultados = {};

  await Promise.all(lista.map(async (ticker) => {
    try {
      // Usamos v8/finance/chart que a veces es más rápido para variaciones diarias
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
      
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        }
      });

      const data = await r.json();
      
      // Intentamos obtener el precio de mercado regular
      const precio = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      const moneda = data?.chart?.result?.[0]?.meta?.currency;

      resultados[ticker] = {
        precio: precio || null,
        moneda: moneda || (ticker.endsWith('D.BA') ? 'USD' : 'ARS') // Mapping manual por si falla el meta
      };

    } catch (error) {
      resultados[ticker] = { precio: null, error: "No encontrado" };
    }
  }));

  res.json(resultados);
}

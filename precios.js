import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: 'Falta parámetro tickers' });

  const lista = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  const resultados = {};

  try {
    // Procesamos en paralelo para mayor velocidad
    await Promise.all(lista.map(async (ticker) => {
      try {
        // La librería maneja la conexión y el parseo automáticamente
        const quote = await yahooFinance.quote(ticker);
        resultados[ticker] = quote.regularMarketPrice || null;
      } catch (err) {
        console.error(`Error con ${ticker}:`, err.message);
        resultados[ticker] = null;
      }
    }));

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

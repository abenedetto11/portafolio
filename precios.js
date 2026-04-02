export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: 'Falta parámetro tickers' });

  const lista = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  const resultados = {};

  let cotizacionMEP = null;
  try {
    const resDolar = await fetch('https://dolarapi.com/v1/dolares/bolsa');
    const datosDolar = await resDolar.json();
    cotizacionMEP = datosDolar.compra;
  } catch {
    cotizacionMEP = null;
  }

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
      const meta = data?.chart?.result?.[0]?.meta;
      let precio = meta?.regularMarketPrice;
      const moneda = meta?.currency;

      if (!precio) {
        resultados[ticker] = { precio: null, moneda: null };
        return;
      }

      // Tickers .BA que NO terminan en D.BA cotizan en ARS → convertir a USD
      // Ejemplos ARS: YPFD.BA, GGAL.BA, PAMP.BA
      // Ejemplos USD: MELID.BA, GGALD.BA, PAMPAD.BA (ya en USD, no convertir)
      const esARS = moneda === 'ARS';
      if (esARS && cotizacionMEP) {
        precio = precio / cotizacionMEP;
      }

      resultados[ticker] = {
        precio: precio,
        moneda: esARS ? 'USD (conv. MEP)' : moneda
      };
    } catch {
      resultados[ticker] = { precio: null, error: true };
    }
  }));

  res.json(resultados);
}

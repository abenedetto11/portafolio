export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tickers } = req.query;
  if (!tickers) return res.status(400).json({ error: 'Falta parámetro tickers' });

  const lista = tickers.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  const resultados = {};

  try {
    // 1. Obtenemos la cotización del dólar MEP/CCL para la conversión
    const resDolar = await fetch('https://dolarapi.com/v1/dolares/bolsa');
    const datosDolar = await resDolar.json();
    const cotizacionMEP = datosDolar.compra; // Usamos el valor de compra para valuar activos

    // 2. Buscamos los precios en Yahoo
    await Promise.all(lista.map(async (ticker) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await r.json();
        const meta = data?.chart?.result?.[0]?.meta;
        let precio = meta?.regularMarketPrice;
        let moneda = meta?.currency;

        // 3. Lógica de conversión automática
        if (moneda === 'ARS' && precio) {
          precio = precio / cotizacionMEP; // Convertimos de Pesos a USD
          moneda = 'USD (convertido)';
        }

        resultados[ticker] = {
          precio: precio || null,
          moneda: moneda || (ticker.endsWith('D.BA') ? 'USD' : 'ARS'),
          cotizacionDolar: cotizacionMEP
        };
      } catch {
        resultados[ticker] = { precio: null, error: true };
      }
    }));

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
}

# Portafolio Tracker

Tracker de CEDEARs y acciones con precios en tiempo real via Yahoo Finance.

## Estructura

```
portafolio/
├── api/
│   └── precios.js       ← Serverless function (proxy a Yahoo Finance)
├── public/
│   └── index.html       ← Frontend
└── vercel.json          ← Configuración de rutas
```

## Deploy en Vercel

### Opción 1 — Vercel CLI

```bash
npm i -g vercel
vercel
```

### Opción 2 — GitHub + Vercel

1. Subí esta carpeta a un repo de GitHub
2. Entrá a vercel.com → "Add New Project"
3. Importá el repo
4. Deploy automático — sin configuración extra necesaria

## Uso

- **Ticker para CEDEARs**: usá el ticker de Yahoo Finance sin `.BA` (la app lo agrega sola).
  - MercadoLibre → `MELID`
  - Alphabet → `GGALD`
  - Apple → `AAPL` (si cotiza directo en USD)
- Los datos se guardan en `localStorage` del browser.
- Los precios se actualizan automáticamente cada 60 segundos.

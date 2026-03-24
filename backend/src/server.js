require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const cron = require('node-cron');

const priceRoutes = require('./routes/prices');
const newsRoutes = require('./routes/news');
const analyzeRoutes = require('./routes/analyze');
const { startBinanceWS } = require('./services/binanceWS');
const { getNewsCache, refreshNews } = require('./services/newsService');

const app = express();
const server = http.createServer(app);

// ── WebSocket server (frontend connects here for live prices) ──
const wss = new WebSocket.Server({ server, path: '/ws' });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

// ── Middleware ──
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ── Routes ──
app.use('/api/prices', priceRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/analyze', analyzeRoutes);

// ── Binance WebSocket → broadcast to clients ──
startBinanceWS((priceUpdate) => {
  broadcast({ type: 'price', data: priceUpdate });
});

// ── Auto-refresh news every 10 minutes ──
cron.schedule('*/10 * * * *', async () => {
  console.log('[CRON] Refreshing news...');
  try {
    await refreshNews();
    const news = getNewsCache();
    broadcast({ type: 'news', data: news.slice(0, 20) });
    console.log(`[CRON] News refreshed: ${news.length} items`);
  } catch (e) {
    console.error('[CRON] News refresh error:', e.message);
  }
});

// Initial news fetch on startup
(async () => {
  try {
    await refreshNews();
    console.log('[INIT] Initial news loaded');
  } catch (e) {
    console.warn('[INIT] Could not load initial news:', e.message);
  }
})();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 ARNSAFAROV TERMINAL Backend`);
  console.log(`   HTTP  → http://localhost:${PORT}`);
  console.log(`   WS    → ws://localhost:${PORT}/ws`);
  console.log(`   News  → auto-refresh every 10 min\n`);
});

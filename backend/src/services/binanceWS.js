const WebSocket = require('ws');

const SYMBOLS = [
  'btcusdt','ethusdt','solusdt','bnbusdt','xrpusdt',
  'dogeusdt','adausdt','avaxusdt','dotusdt','linkusdt',
  'maticusdt','ltcusdt','atomusdt','uniusdt','aaveusdt',
];

const STREAM = `wss://stream.binance.com:9443/stream?streams=${
  SYMBOLS.map(s => `${s}@ticker`).join('/')
}`;

let binanceWS = null;
let reconnectTimer = null;
let onPriceUpdate = null;

function startBinanceWS(callback) {
  onPriceUpdate = callback;
  connect();
}

function connect() {
  if (binanceWS) {
    try { binanceWS.terminate(); } catch(e) {}
  }

  console.log('[Binance WS] Connecting...');
  binanceWS = new WebSocket(STREAM);

  binanceWS.on('open', () => {
    console.log('[Binance WS] Connected — streaming', SYMBOLS.length, 'pairs');
  });

  binanceWS.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (!msg.data) return;
      const d = msg.data;
      const sym = d.s.replace('USDT', '');
      const update = {
        symbol: sym,
        pair: d.s,
        price: parseFloat(d.c),
        change24h: parseFloat(d.P),
        high24h: parseFloat(d.h),
        low24h: parseFloat(d.l),
        volume: parseFloat(d.v),
        quoteVolume: parseFloat(d.q),
        priceChangeAbs: parseFloat(d.p),
        ts: Date.now(),
      };
      if (onPriceUpdate) onPriceUpdate(update);
    } catch (e) {
      // Ignore parse errors
    }
  });

  binanceWS.on('close', () => {
    console.warn('[Binance WS] Disconnected. Reconnecting in 5s...');
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 5000);
  });

  binanceWS.on('error', (err) => {
    console.error('[Binance WS] Error:', err.message);
  });
}

module.exports = { startBinanceWS };

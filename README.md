# ARNSAFAROV TERMINAL

Real-time financial intelligence platform — React + Node.js + AI

---

## QUICK START

### 1. Backend setup

```bash
cd backend
cp .env.example .env
# .env faylını açıb açarlarını daxil et (NewsAPI, OpenAI — opsional)
npm install
npm start
# Backend: http://localhost:4000
```

### 2. Frontend setup (yeni terminal)

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

---

## API Keys

| Key | Hara | Məcburi? |
|-----|------|----------|
| `NEWS_API_KEY` | https://newsapi.org | ❌ Opsional (RSS pulsuz işləyir) |
| `OPENAI_API_KEY` | https://platform.openai.com | ❌ Opsional (rule-based fallback var) |

**Açar olmadan da işləyir** — kripto qiymətlər (CoinGecko + Binance) və RSS xəbərləri tam işləyir.

---

## Features

- ✅ **Real-time qiymətlər** — Binance WebSocket (BTC, ETH, SOL, BNB, XRP, DOGE, ADA, AVAX + daha çox)
- ✅ **CoinGecko** — Top 100 kripto, market cap, volume, 24h change
- ✅ **Canlı xəbərlər** — CoinDesk, CoinTelegraph, Decrypt RSS (hər 10 dəq)
- ✅ **AI Analiz** — OpenAI GPT-3.5 (açar olmasa rule-based fallback)
- ✅ **Siqnallar** — BUY / SELL / HOLD + confidence %
- ✅ **Watchlist** — localStorage-da saxlanılır
- ✅ **3 dil** — AZ / RU / EN
- ✅ **Animations** — Framer Motion (hover, expand, price flash)

---

## Architecture

```
arnsafarov/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + WS server
│   │   ├── routes/
│   │   │   ├── prices.js      # CoinGecko API
│   │   │   ├── news.js        # News router
│   │   │   └── analyze.js     # AI analysis (OpenAI / fallback)
│   │   └── services/
│   │       ├── binanceWS.js   # Binance WebSocket stream
│   │       └── newsService.js # RSS + NewsAPI fetcher
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx
        ├── store/index.js      # Zustand global state
        ├── hooks/
        │   ├── useWebSocket.js # WS connection
        │   ├── usePrices.js    # CoinGecko polling
        │   └── useNews.js      # News polling
        ├── components/
        │   ├── Topbar.jsx
        │   ├── Ticker.jsx
        │   ├── Sidebar.jsx
        │   ├── RightPanel.jsx
        │   └── NewsCard.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Markets.jsx
        │   ├── NewsPage.jsx
        │   ├── Signals.jsx
        │   ├── Watchlist.jsx
        │   └── Settings.jsx
        └── utils/
            ├── api.js
            ├── format.js
            └── translations.js
```

---

## Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/prices/crypto?limit=100` | GET | CoinGecko top coins |
| `/api/prices/global` | GET | Market global stats |
| `/api/prices/coin/:id` | GET | Single coin detail |
| `/api/prices/trending` | GET | Trending coins |
| `/api/news?cat=crypto&limit=40` | GET | News feed |
| `/api/news/refresh` | POST | Force news refresh |
| `/api/analyze` | POST | AI analyze single news |
| `/api/analyze/batch` | POST | AI analyze batch (max 10) |
| `/ws` | WebSocket | Live price stream |

---

## Production Deploy (Render.com)

1. **Backend**: New Web Service → `backend/` folder → `npm install && npm start`
2. **Frontend**: New Static Site → `frontend/` folder → `npm run build` → publish `dist/`
3. `.env` dəyişənlərini Render dashboard-da set et
4. Frontend `vite.config.js`-də proxy URL-ni Render backend URL-nə dəyiş

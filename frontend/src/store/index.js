import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Live prices from Binance WS
  liveprices: {},
  setLivePrices: (update) => set(state => ({
    liveprices: { ...state.liveprices, [update.symbol]: update }
  })),

  // CoinGecko prices (full data)
  coins: [],
  setCoins: (coins) => set({ coins }),

  // Global market stats
  globalStats: null,
  setGlobalStats: (globalStats) => set({ globalStats }),

  // News
  news: [],
  setNews: (news) => set({ news }),
  newsLastUpdated: null,
  setNewsLastUpdated: (t) => set({ newsLastUpdated: t }),

  // Signals from AI
  signals: {},
  setSignal: (newsId, signal) => set(state => ({
    signals: { ...state.signals, [newsId]: signal }
  })),

  // Watchlist
  watchlist: JSON.parse(localStorage.getItem('arnsafarov_watchlist') || '["bitcoin","ethereum","solana","binancecoin","ripple"]'),
  addToWatchlist: (id) => {
    const wl = [...new Set([...get().watchlist, id])]
    localStorage.setItem('arnsafarov_watchlist', JSON.stringify(wl))
    set({ watchlist: wl })
  },
  removeFromWatchlist: (id) => {
    const wl = get().watchlist.filter(x => x !== id)
    localStorage.setItem('arnsafarov_watchlist', JSON.stringify(wl))
    set({ watchlist: wl })
  },

  // UI
  activePage: 'dashboard',
  setActivePage: (activePage) => set({ activePage }),
  selectedNews: null,
  setSelectedNews: (selectedNews) => set({ selectedNews }),
  lang: localStorage.getItem('arnsafarov_lang') || 'az',
  setLang: (lang) => {
    localStorage.setItem('arnsafarov_lang', lang)
    set({ lang })
  },

  // WebSocket
  wsConnected: false,
  setWsConnected: (wsConnected) => set({ wsConnected }),
}))

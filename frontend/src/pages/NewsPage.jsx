import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { refreshNews } from '../utils/api'
import NewsCard from '../components/NewsCard'

const CATS = ['all', 'crypto', 'macro', 'stocks', 'commodity']

export default function NewsPage() {
  const lang = useStore(s => s.lang)
  const news = useStore(s => s.news)
  const setNews = useStore(s => s.setNews)
  const newsLastUpdated = useStore(s => s.newsLastUpdated)
  const t = useT(lang)
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const catLabels = { all: t.all, crypto: t.crypto, macro: t.macro, stocks: t.stocks, commodity: t.commodity }

  const filtered = news.filter(n => {
    const matchCat = cat === 'all' || n.cat === cat
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const data = await refreshNews()
      if (data.success) {
        const res = await import('../utils/api').then(m => m.fetchNews({ limit: 60 }))
        if (res.items) setNews(res.items)
      }
    } catch(e) {}
    setRefreshing(false)
  }

  const updatedStr = newsLastUpdated
    ? new Date(newsLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 bg-bg-1 border-b border-border flex items-center gap-2 px-3 flex-shrink-0">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all
              ${cat === c
                ? 'text-text-1 border-border-2 bg-bg-3'
                : 'text-text-3 border-transparent hover:text-text-2'}`}
          >
            {catLabels[c]}
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Axtar..."
          className="ml-2 bg-bg-2 border border-border text-text-1 text-[11px] px-2 py-0.5 rounded w-36 outline-none focus:border-blue-700 placeholder-text-3"
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[9px] text-text-3">{updatedStr}</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-6 w-6 flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-bg-2 rounded transition-colors disabled:opacity-50"
          >
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={refreshing ? 'animate-spin' : ''}
            >
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <span className="font-mono text-[9px] text-text-3 bg-bg-4 px-1 rounded">{filtered.length}</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-[11px] text-text-3 text-center">{t.noNews}</div>
        ) : (
          filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <NewsCard item={item} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

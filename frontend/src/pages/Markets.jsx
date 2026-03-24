import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { fmtPrice, fmtPct, fmtLarge, chgColor } from '../utils/format'

const CATS = ['all', 'crypto']
const PER_PAGE = 50

export default function Markets() {
  const lang = useStore(s => s.lang)
  const coins = useStore(s => s.coins)
  const liveprices = useStore(s => s.liveprices)
  const watchlist = useStore(s => s.watchlist)
  const addToWatchlist = useStore(s => s.addToWatchlist)
  const removeFromWatchlist = useStore(s => s.removeFromWatchlist)
  const t = useT(lang)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('rank')
  const [sortDir, setSortDir] = useState(1)

  const merged = useMemo(() => coins.map(c => ({
    ...c,
    price: liveprices[c.symbol]?.price ?? c.price,
    change24h: liveprices[c.symbol]?.change24h ?? c.change24h,
  })), [coins, liveprices])

  const filtered = useMemo(() => {
    let list = merged
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0
      return (av - bv) * sortDir
    })
    return list
  }, [merged, search, sortKey, sortDir])

  const paginated = filtered.slice(0, page * PER_PAGE)

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const cols = [
    { key: 'rank', label: t.rank, align: 'left', w: 'w-8' },
    { key: 'name', label: t.assets, align: 'left', w: 'flex-1' },
    { key: 'price', label: t.price, align: 'right', w: 'w-24' },
    { key: 'change24h', label: t.change24h, align: 'right', w: 'w-20' },
    { key: 'marketCap', label: t.marketCap, align: 'right', w: 'w-24' },
    { key: 'volume', label: t.volume, align: 'right', w: 'w-24' },
    { key: 'watchlist', label: '★', align: 'center', w: 'w-10' },
  ]

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="h-10 bg-bg-1 border-b border-border flex items-center gap-3 px-3 flex-shrink-0">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="BTC, Ethereum..."
          className="bg-bg-2 border border-border text-text-1 text-[11px] px-2.5 py-1 rounded w-44 outline-none focus:border-blue-700 placeholder-text-3"
        />
        <span className="font-mono text-[9px] text-text-3 ml-auto">{filtered.length} {t.assets}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center px-3 py-1.5 border-b border-border bg-bg-2 sticky top-0">
          {cols.map(col => (
            <div
              key={col.key}
              onClick={() => col.key !== 'watchlist' && toggleSort(col.key)}
              className={`font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase
                ${col.w} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                ${col.key !== 'watchlist' ? 'cursor-pointer hover:text-text-1 select-none' : ''}`}
            >
              {col.label}
              {sortKey === col.key && <span className="ml-0.5">{sortDir === -1 ? '↓' : '↑'}</span>}
            </div>
          ))}
        </div>

        {paginated.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.01, 0.3) }}
            className="flex items-center px-3 py-2 border-b border-border hover:bg-bg-2 transition-colors"
          >
            <span className="font-mono text-[10px] text-text-3 w-8">{c.rank}</span>
            <div className="flex-1">
              <div className="font-mono text-[11px] font-medium text-text-1">{c.symbol}</div>
              <div className="text-[9px] text-text-3">{c.name}</div>
            </div>
            <span className="font-mono text-[11px] font-medium text-text-1 w-24 text-right">{fmtPrice(c.price)}</span>
            <span className={`font-mono text-[10px] font-semibold w-20 text-right ${chgColor(c.change24h)}`}>{fmtPct(c.change24h)}</span>
            <span className="font-mono text-[10px] text-text-2 w-24 text-right">{fmtLarge(c.marketCap)}</span>
            <span className="font-mono text-[10px] text-text-2 w-24 text-right">{fmtLarge(c.volume)}</span>
            <div className="w-10 flex justify-center">
              <button
                onClick={() => watchlist.includes(c.id) ? removeFromWatchlist(c.id) : addToWatchlist(c.id)}
                className={`text-[13px] transition-colors hover:scale-110 transform
                  ${watchlist.includes(c.id) ? 'text-amber-400' : 'text-text-3 hover:text-amber-400'}`}
              >★</button>
            </div>
          </motion.div>
        ))}

        {paginated.length < filtered.length && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full py-3 text-[11px] text-blue-400 hover:text-blue-300 border-t border-border"
          >
            Load more ({filtered.length - paginated.length} remaining)
          </button>
        )}
      </div>
    </div>
  )
}

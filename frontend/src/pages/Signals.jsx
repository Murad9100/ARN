import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { signalColor, signalBg, timeAgo } from '../utils/format'
import { analyzeBatch } from '../utils/api'

export default function Signals() {
  const lang = useStore(s => s.lang)
  const news = useStore(s => s.news)
  const coins = useStore(s => s.coins)
  const signals = useStore(s => s.signals)
  const setSignal = useStore(s => s.setSignal)
  const t = useT(lang)
  const [analyzing, setAnalyzing] = useState(false)
  const [filter, setFilter] = useState('all')

  const analyzed = news.filter(n => signals[n.id])
  const unanalyzed = news.filter(n => !signals[n.id])

  async function analyzeAll() {
    if (analyzing) return
    setAnalyzing(true)
    try {
      const prices = coins.slice(0, 10).map(c => ({ symbol: c.symbol, price: c.price, change24h: c.change24h }))
      const batch = unanalyzed.slice(0, 10)
      const results = await analyzeBatch(batch, prices)
      results.forEach(r => {
        const { newsId, ...signal } = r
        if (newsId) setSignal(newsId, signal)
      })
    } catch (e) {
      console.error('[Signals]', e.message)
    }
    setAnalyzing(false)
  }

  const displayed = analyzed.filter(n => {
    const s = signals[n.id]
    if (filter === 'all') return true
    return s?.signal === filter
  })

  const counts = {
    BUY: analyzed.filter(n => signals[n.id]?.signal === 'BUY').length,
    SELL: analyzed.filter(n => signals[n.id]?.signal === 'SELL').length,
    HOLD: analyzed.filter(n => signals[n.id]?.signal === 'HOLD').length,
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-10 bg-bg-1 border-b border-border flex items-center gap-2 px-3 flex-shrink-0">
        {/* Filter tabs */}
        {['all','BUY','SELL','HOLD'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-all
              ${filter === f ? 'text-text-1 border-border-2 bg-bg-3' : 'text-text-3 border-transparent hover:text-text-2'}`}
          >
            {f === 'all' ? t.all : f === 'BUY' ? t.buy : f === 'SELL' ? t.sell : t.hold}
            {f !== 'all' && <span className="ml-1 font-mono text-[9px]">({counts[f] || 0})</span>}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[9px] text-text-3">{analyzed.length} analyzed · {unanalyzed.length} pending</span>
          {unanalyzed.length > 0 && (
            <button
              onClick={analyzeAll}
              disabled={analyzing}
              className="text-[10px] px-2 py-0.5 bg-blue-900/30 border border-blue-800 text-blue-400 rounded hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
            >
              {analyzing ? t.analyzing : `${t.analyzeBtn} (${Math.min(unanalyzed.length, 10)})`}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 border-b border-border">
          <SummaryCard label={t.buy} count={counts.BUY} signal="BUY" t={t} />
          <SummaryCard label={t.sell} count={counts.SELL} signal="SELL" t={t} />
          <SummaryCard label={t.hold} count={counts.HOLD} signal="HOLD" t={t} />
        </div>

        {displayed.length === 0 ? (
          <div className="p-6 text-center text-[11px] text-text-3">
            {analyzed.length === 0 ? t.noSignal + ' · ' + t.analyzeBtn : t.noData}
          </div>
        ) : (
          displayed.map((n, i) => {
            const sig = signals[n.id]
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className="border-b border-border p-3 hover:bg-bg-2 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] text-blue-400 mb-1">{n.source} · {timeAgo(n.publishedAt, lang)}</div>
                    <div className="text-[11px] font-medium text-text-1 leading-snug mb-1.5 line-clamp-2">{n.title}</div>
                    <div className="text-[11px] text-text-2 leading-relaxed mb-2">{sig.explanation}</div>
                    <div className="flex items-center gap-2">
                      <ConfBar value={sig.confidence} signal={sig.signal} />
                      {n.assets?.map(a => (
                        <span key={a} className="font-mono text-[9px] text-text-2 bg-bg-4 px-1 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`flex-shrink-0 flex flex-col items-center gap-1 px-2.5 py-2 rounded border min-w-[64px] ${signalBg(sig.signal)}`}>
                    <span className={`font-mono text-[11px] font-bold ${signalColor(sig.signal)}`}>
                      {sig.signal === 'BUY' ? t.buy : sig.signal === 'SELL' ? t.sell : t.hold}
                    </span>
                    <span className="font-mono text-[9px] text-text-3">{sig.confidence}%</span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, count, signal, t }) {
  const colors = { BUY: 'text-green-400 border-r', SELL: 'text-red-400 border-r', HOLD: 'text-amber-400' }
  return (
    <div className={`bg-bg-1 px-4 py-3 ${colors[signal]?.split(' ')[1] || ''} border-border`}>
      <div className="font-mono text-[8px] tracking-widest text-text-3 uppercase mb-1">
        {signal === 'BUY' ? t.buy : signal === 'SELL' ? t.sell : t.hold}
      </div>
      <div className={`font-mono text-[22px] font-medium ${colors[signal]?.split(' ')[0]}`}>{count}</div>
    </div>
  )
}

function ConfBar({ value, signal }) {
  const colors = { BUY: 'bg-green-400', SELL: 'bg-red-400', HOLD: 'bg-amber-400' }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-[2px] bg-bg-4 rounded overflow-hidden">
        <div className={`h-full rounded ${colors[signal] || 'bg-text-3'}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-[9px] text-text-3">{value}%</span>
    </div>
  )
}

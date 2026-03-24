import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { timeAgo, signalColor, signalBg, impactColor, chgColor } from '../utils/format'
import { analyzeNews } from '../utils/api'

const IMP_COLORS = { HIGH: 'bg-red-700', MEDIUM: 'bg-amber-600', LOW: '#334155' }

export default function NewsCard({ item, style }) {
  const lang = useStore(s => s.lang)
  const coins = useStore(s => s.coins)
  const signals = useStore(s => s.signals)
  const setSignal = useStore(s => s.setSignal)
  const t = useT(lang)
  const [open, setOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const signal = signals[item.id]

  async function handleAnalyze(e) {
    e.stopPropagation()
    if (signal || analyzing) return
    setAnalyzing(true)
    try {
      const prices = coins.slice(0, 10).map(c => ({
        symbol: c.symbol, price: c.price, change24h: c.change24h
      }))
      const result = await analyzeNews(item, prices)
      setSignal(item.id, result)
    } catch (err) {
      console.error('[Analyze]', err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const impColor = IMP_COLORS[item.impact] || IMP_COLORS.LOW
  const dirLabelMap = {
    BULLISH: t.bullish, BEARISH: t.bearish, NEUTRAL: t.neutral
  }
  const impLabelMap = {
    HIGH: t.high, MEDIUM: t.medium, LOW: t.low
  }

  return (
    <motion.div
      layout
      style={style}
      className={`border-b border-border relative overflow-hidden cursor-pointer transition-colors
        ${open ? 'bg-bg-3' : 'hover:bg-bg-2'}`}
      onClick={() => setOpen(o => !o)}
    >
      {/* left impact bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: item.impact === 'HIGH' ? '#ef4444' : item.impact === 'MEDIUM' ? '#f59e0b' : '#334155' }}
      />

      <div className="pl-4 pr-8 pt-2.5 pb-2.5">
        {/* Meta row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="font-mono text-[9px] font-medium text-blue-400 tracking-wider">{item.source}</span>
          <span className="text-text-3 text-[9px]">·</span>
          <span className="font-mono text-[9px] text-text-3">{timeAgo(item.publishedAt, lang)}</span>
          <div className="ml-auto flex items-center gap-1">
            <span className={`font-mono text-[8px] font-semibold px-1 py-0.5 rounded border
              ${item.impact === 'HIGH' ? 'text-red-400 border-red-800 bg-red-900/20'
              : item.impact === 'MEDIUM' ? 'text-amber-400 border-amber-800 bg-amber-900/20'
              : 'text-text-3 border-border bg-bg-4'}`}>
              {impLabelMap[item.impact] || item.impact}
            </span>
            <span className={`font-mono text-[8px] font-semibold px-1 py-0.5 rounded border
              ${item.direction === 'BULLISH' ? 'text-green-400 border-green-800 bg-green-900/20'
              : item.direction === 'BEARISH' ? 'text-red-400 border-red-800 bg-red-900/20'
              : 'text-text-2 border-border bg-bg-4'}`}>
              {dirLabelMap[item.direction] || item.direction}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-[12px] font-medium text-text-1 leading-[1.45] mb-1">{item.title}</div>

        {/* Summary */}
        <div className="text-[11px] text-text-2 leading-[1.45] line-clamp-2">{item.description}</div>

        {/* Asset chips */}
        {item.assets?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {item.assets.map(a => (
              <span key={a} className="font-mono text-[9px] text-text-2 bg-bg-4 px-1 rounded">{a}</span>
            ))}
          </div>
        )}

        {/* Signal badge if analyzed */}
        {signal && (
          <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded border ${signalBg(signal.signal)}`}>
            <span className={`font-mono text-[9px] font-bold ${signalColor(signal.signal)}`}>
              {signal.signal === 'BUY' ? t.buy : signal.signal === 'SELL' ? t.sell : t.hold}
            </span>
            <span className="text-[9px] text-text-3">{signal.confidence}% {t.confidence}</span>
          </div>
        )}
      </div>

      {/* Arrow */}
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute right-3 top-3 text-[10px] text-text-3"
      >▼</motion.span>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 pt-0 pb-3 border-t border-border mt-0">
              {signal ? (
                <div className="mt-2.5 space-y-2">
                  {/* Signal detail */}
                  <div className={`p-2.5 rounded border ${signalBg(signal.signal)}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[8px] font-bold tracking-widest text-text-3">AI {t.signal}</span>
                      <span className={`font-mono text-[10px] font-bold ${signalColor(signal.signal)}`}>
                        {signal.signal} · {signal.confidence}%
                      </span>
                    </div>
                    <p className="text-[11px] text-text-2 leading-relaxed">{signal.explanation}</p>
                  </div>
                  {/* Meters */}
                  <ConfBar label={t.confidence} value={signal.confidence} color={signalColor(signal.signal)} />
                </div>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="mt-2.5 w-full py-2 text-[11px] font-medium text-blue-400 border border-blue-900 bg-blue-900/20 rounded hover:bg-blue-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? t.analyzing : t.analyzeBtn}
                </button>
              )}

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[10px] text-blue-400 hover:text-blue-300"
                  onClick={e => e.stopPropagation()}
                >
                  {t.readMore}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ConfBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] text-text-3 w-16 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-[2px] bg-bg-4 rounded overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full bg-current rounded"
          style={{ color: 'inherit' }}
        />
      </div>
      <span className={`font-mono text-[10px] font-semibold w-8 text-right ${color}`}>{value}%</span>
    </div>
  )
}

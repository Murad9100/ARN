import React from 'react'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { fmtPrice, fmtPct, fmtLarge, chgColor } from '../utils/format'

export default function Watchlist() {
  const lang = useStore(s => s.lang)
  const watchlist = useStore(s => s.watchlist)
  const coins = useStore(s => s.coins)
  const liveprices = useStore(s => s.liveprices)
  const removeFromWatchlist = useStore(s => s.removeFromWatchlist)
  const t = useT(lang)

  const items = watchlist
    .map(id => {
      const cg = coins.find(c => c.id === id)
      if (!cg) return null
      const live = liveprices[cg.symbol]
      return { ...cg, price: live?.price ?? cg.price, change24h: live?.change24h ?? cg.change24h }
    })
    .filter(Boolean)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-9 bg-bg-1 border-b border-border flex items-center px-3">
        <span className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase">{t.watchlist}</span>
        <span className="ml-2 font-mono text-[9px] text-text-3 bg-bg-4 px-1 rounded">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-[11px] text-text-3">
          {t.noData} — {t.addWatchlist} {t.markets.toLowerCase()} bölməsindən
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg-2">
              <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-3 py-2 text-left w-8">#</th>
              <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-2 text-left">{t.assets}</th>
              <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-2 text-right">{t.price}</th>
              <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-2 text-right">{t.change24h}</th>
              <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-2 text-right">{t.marketCap}</th>
              <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-2 text-right">{t.volume}</th>
              <th className="w-10"/>
            </tr>
          </thead>
          <tbody>
            {items.map((c, i) => (
              <tr key={c.id} className="border-b border-border hover:bg-bg-2 transition-colors">
                <td className="font-mono text-[10px] text-text-3 px-3 py-2">{c.rank}</td>
                <td className="px-2 py-2">
                  <div className="font-mono text-[11px] font-medium text-text-1">{c.symbol}</div>
                  <div className="text-[9px] text-text-3">{c.name}</div>
                </td>
                <td className="font-mono text-[11px] font-medium text-text-1 px-2 py-2 text-right">{fmtPrice(c.price)}</td>
                <td className={`font-mono text-[10px] font-semibold px-2 py-2 text-right ${chgColor(c.change24h)}`}>{fmtPct(c.change24h)}</td>
                <td className="font-mono text-[10px] text-text-2 px-2 py-2 text-right">{fmtLarge(c.marketCap)}</td>
                <td className="font-mono text-[10px] text-text-2 px-2 py-2 text-right">{fmtLarge(c.volume)}</td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => removeFromWatchlist(c.id)}
                    className="text-[10px] text-text-3 hover:text-red-400 transition-colors px-1"
                    title={t.removeWatchlist}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

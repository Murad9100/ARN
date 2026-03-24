import React, { useRef, useEffect, useState } from 'react'
import { useStore } from '../store'
import { fmtPrice, fmtPct } from '../utils/format'

export default function Ticker() {
  const coins = useStore(s => s.coins)
  const liveprices = useStore(s => s.liveprices)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (coins.length === 0) return
    const merged = coins.slice(0, 12).map(c => {
      const live = liveprices[c.symbol]
      return {
        symbol: c.symbol,
        price: live?.price ?? c.price,
        change: live?.change24h ?? c.change24h,
      }
    })
    setItems([...merged, ...merged]) // duplicate for seamless loop
  }, [coins, liveprices])

  if (items.length === 0) return (
    <div className="h-6 bg-bg border-b border-border flex items-center px-3">
      <div className="skeleton h-2 w-32"/>
    </div>
  )

  return (
    <div className="h-6 bg-bg border-b border-border overflow-hidden flex items-center flex-shrink-0">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: 'scroll 60s linear infinite' }}
      >
        {items.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-border h-6 font-mono text-[10px]">
            <span className="text-text-3 tracking-wider">{c.symbol}</span>
            <span className="text-text-1 font-medium">{fmtPrice(c.price)}</span>
            <span className={c.change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {c.change >= 0 ? '▲' : '▼'}{Math.abs(c.change || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

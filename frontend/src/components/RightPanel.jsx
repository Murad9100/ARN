import React, { useRef, useEffect } from 'react'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { fmtPrice, fmtPct, chgColor, signalColor, signalBg } from '../utils/format'

const PANEL_COINS = ['BTC','ETH','SOL','BNB','XRP','DOGE','ADA','AVAX']

export default function RightPanel() {
  const lang = useStore(s => s.lang)
  const coins = useStore(s => s.coins)
  const liveprices = useStore(s => s.liveprices)
  const signals = useStore(s => s.signals)
  const globalStats = useStore(s => s.globalStats)
  const t = useT(lang)

  const panelCoins = PANEL_COINS.map(sym => {
    const cg = coins.find(c => c.symbol === sym)
    const live = liveprices[sym]
    return {
      symbol: sym,
      name: cg?.name || sym,
      price: live?.price ?? cg?.price,
      change: live?.change24h ?? cg?.change24h,
    }
  }).filter(c => c.price)

  // Top movers sorted by abs change
  const movers = [...panelCoins].sort((a, b) => Math.abs(b.change||0) - Math.abs(a.change||0)).slice(0, 5)

  // Aggregate signal counts
  const allSignals = Object.values(signals)
  const buys = allSignals.filter(s => s.signal === 'BUY').length
  const sells = allSignals.filter(s => s.signal === 'SELL').length
  const holds = allSignals.filter(s => s.signal === 'HOLD').length

  return (
    <div className="w-56 flex-shrink-0 bg-bg-1 flex flex-col overflow-y-auto border-l border-border">

      {/* Market prices */}
      <PanelSection title="MARKET">
        {panelCoins.map(c => (
          <PriceRow key={c.symbol} coin={c} />
        ))}
      </PanelSection>

      {/* Top movers */}
      <PanelSection title={t.topMovers}>
        {movers.map((c, i) => (
          <div key={c.symbol} className="flex items-center h-[22px] gap-1 px-0.5 hover:bg-bg-2 transition-colors">
            <span className="font-mono text-[9px] text-text-3 w-3">{i+1}</span>
            <span className="font-mono text-[10px] font-medium text-text-1 w-9">{c.symbol}</span>
            <span className="text-[9px] text-text-3 flex-1">{c.name}</span>
            <span className={`font-mono text-[10px] font-semibold w-11 text-right ${chgColor(c.change)}`}>
              {fmtPct(c.change)}
            </span>
          </div>
        ))}
      </PanelSection>

      {/* Global stats */}
      {globalStats && (
        <PanelSection title="GLOBAL">
          <StatRow label={t.totalMarketCap} val={fmtLarge(globalStats.totalMarketCap)} />
          <StatRow label={t.btcDominance} val={globalStats.btcDominance?.toFixed(1) + '%'} />
          <StatRow label="24h Vol" val={fmtLarge(globalStats.totalVolume)} />
          <StatRow label="Change 24h" val={fmtPct(globalStats.marketCapChange)} color={chgColor(globalStats.marketCapChange)} />
        </PanelSection>
      )}

      {/* Signal summary */}
      {allSignals.length > 0 && (
        <PanelSection title={t.aiSignals + ' BETA'}>
          <div className="flex gap-2 py-1">
            <SignalPill label={t.buy} count={buys} color="text-green-400" bg="bg-green-900/30 border-green-700/40" />
            <SignalPill label={t.sell} count={sells} color="text-red-400" bg="bg-red-900/30 border-red-700/40" />
            <SignalPill label={t.hold} count={holds} color="text-amber-400" bg="bg-amber-900/30 border-amber-700/40" />
          </div>
        </PanelSection>
      )}

      <div className="mt-auto p-2.5 text-[9px] text-text-3 border-t border-border">{t.disc}</div>
    </div>
  )
}

function PanelSection({ title, children }) {
  return (
    <div className="border-b border-border flex-shrink-0">
      <div className="h-6 bg-bg-2 border-b border-border flex items-center px-2.5">
        <span className="font-mono text-[8px] font-semibold tracking-[.14em] uppercase text-text-3">{title}</span>
      </div>
      <div className="px-2 py-1">{children}</div>
    </div>
  )
}

function PriceRow({ coin }) {
  const prevRef = useRef(coin.price)
  const elRef = useRef(null)

  useEffect(() => {
    if (!elRef.current || prevRef.current === coin.price) return
    const isUp = coin.price > prevRef.current
    elRef.current.classList.remove('price-flash-up', 'price-flash-down')
    void elRef.current.offsetWidth
    elRef.current.classList.add(isUp ? 'price-flash-up' : 'price-flash-down')
    prevRef.current = coin.price
  }, [coin.price])

  return (
    <div className="flex items-center h-[22px] gap-0 px-0.5 hover:bg-bg-2 transition-colors cursor-default">
      <span className="font-mono text-[10px] font-medium text-text-1 w-10">{coin.symbol}</span>
      <span className="text-[9px] text-text-3 flex-1">{coin.name}</span>
      <span ref={elRef} className="font-mono text-[10px] font-medium text-text-1 w-16 text-right">
        {fmtPrice(coin.price)}
      </span>
      <span className={`font-mono text-[9px] font-semibold w-10 text-right ${chgColor(coin.change)}`}>
        {fmtPct(coin.change)}
      </span>
    </div>
  )
}

function StatRow({ label, val, color }) {
  return (
    <div className="flex items-center justify-between h-[20px]">
      <span className="text-[9px] text-text-3">{label}</span>
      <span className={`font-mono text-[10px] font-medium ${color || 'text-text-1'}`}>{val}</span>
    </div>
  )
}

function SignalPill({ label, count, color, bg }) {
  return (
    <div className={`flex-1 flex flex-col items-center py-1 rounded border ${bg}`}>
      <span className={`font-mono text-[11px] font-bold ${color}`}>{count}</span>
      <span className={`font-mono text-[8px] ${color}`}>{label}</span>
    </div>
  )
}

function fmtLarge(n) {
  if (!n) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  return '$' + (n / 1e6).toFixed(0) + 'M'
}

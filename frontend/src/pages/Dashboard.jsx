import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'
import { fmtPrice, fmtPct, fmtLarge, chgColor } from '../utils/format'
import NewsCard from '../components/NewsCard'

export default function Dashboard() {
  const lang = useStore(s => s.lang)
  const news = useStore(s => s.news)
  const coins = useStore(s => s.coins)
  const liveprices = useStore(s => s.liveprices)
  const globalStats = useStore(s => s.globalStats)
  const t = useT(lang)

  const topCoins = coins.slice(0, 8).map(c => ({
    ...c,
    price: liveprices[c.symbol]?.price ?? c.price,
    change24h: liveprices[c.symbol]?.change24h ?? c.change24h,
  }))

  const recentNews = news.slice(0, 15)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Global stats bar */}
      {globalStats && (
        <div className="grid grid-cols-4 border-b border-border">
          <StatCard label={t.totalMarketCap} value={fmtLarge(globalStats.totalMarketCap)}
            sub={fmtPct(globalStats.marketCapChange)} subColor={chgColor(globalStats.marketCapChange)} />
          <StatCard label={t.btcDominance} value={globalStats.btcDominance?.toFixed(1) + '%'} />
          <StatCard label="24h Volume" value={fmtLarge(globalStats.totalVolume)} />
          <StatCard label="Active Cryptos" value={globalStats.activeCryptos?.toLocaleString()} />
        </div>
      )}

      <div className="flex gap-0 h-full">
        {/* Left: News feed */}
        <div className="flex-1 border-r border-border overflow-y-auto">
          <div className="h-7 bg-bg-1 border-b border-border flex items-center px-3">
            <span className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase">{t.news}</span>
            <span className="ml-2 font-mono text-[9px] text-text-3 bg-bg-4 px-1 rounded">{recentNews.length}</span>
          </div>
          {recentNews.length === 0 ? (
            <div className="p-4 text-[11px] text-text-3">{t.loading}</div>
          ) : (
            recentNews.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <NewsCard item={item} />
              </motion.div>
            ))
          )}
        </div>

        {/* Right: Top assets */}
        <div className="w-64 flex-shrink-0 overflow-y-auto">
          <div className="h-7 bg-bg-1 border-b border-border flex items-center px-3">
            <span className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase">{t.marketOverview}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-3 py-1.5 text-left">{t.rank}</th>
                <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-1.5 text-left">{t.assets}</th>
                <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-1.5 text-right">{t.price}</th>
                <th className="font-mono text-[8px] font-semibold tracking-wider text-text-3 uppercase px-2 py-1.5 text-right">{t.change24h}</th>
              </tr>
            </thead>
            <tbody>
              {topCoins.map(c => (
                <tr key={c.id} className="border-b border-border hover:bg-bg-2 transition-colors cursor-default">
                  <td className="font-mono text-[10px] text-text-3 px-3 py-1.5">{c.rank}</td>
                  <td className="px-2 py-1.5">
                    <div className="font-mono text-[10px] font-medium text-text-1">{c.symbol}</div>
                    <div className="text-[9px] text-text-3">{c.name}</div>
                  </td>
                  <td className="font-mono text-[10px] font-medium text-text-1 px-2 py-1.5 text-right">
                    {fmtPrice(c.price)}
                  </td>
                  <td className={`font-mono text-[10px] font-semibold px-2 py-1.5 text-right ${chgColor(c.change24h)}`}>
                    {fmtPct(c.change24h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, subColor }) {
  return (
    <div className="bg-bg-1 border-r border-border px-3 py-2.5 last:border-r-0">
      <div className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase mb-1">{label}</div>
      <div className="font-mono text-[15px] font-medium text-text-1">{value || '—'}</div>
      {sub && <div className={`font-mono text-[9px] mt-0.5 ${subColor || 'text-text-3'}`}>{sub}</div>}
    </div>
  )
}

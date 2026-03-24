import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'

const PAGES = [
  { id: 'dashboard', icon: GridIcon },
  { id: 'markets', icon: ChartIcon },
  { id: 'news', icon: NewsIcon },
  { id: 'signals', icon: SignalIcon },
  { id: 'watchlist', icon: StarIcon },
  { id: 'settings', icon: SettingsIcon },
]

function GridIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function ChartIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}
function NewsIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 10h16M4 14h8"/></svg>
}
function SignalIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function StarIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function SettingsIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
}

export default function Sidebar() {
  const activePage = useStore(s => s.activePage)
  const setActivePage = useStore(s => s.setActivePage)
  const lang = useStore(s => s.lang)
  const news = useStore(s => s.news)
  const t = useT(lang)

  return (
    <div className="w-44 flex-shrink-0 bg-bg-1 border-r border-border flex flex-col overflow-hidden">
      <div className="px-3 pt-2.5 pb-1 font-mono text-[8px] font-medium tracking-[.14em] text-text-3 uppercase flex-shrink-0">
        {t.markets}
      </div>

      {PAGES.slice(0, 4).map(({ id, icon: Icon }) => (
        <NavItem
          key={id}
          id={id}
          label={t[id]}
          icon={<Icon />}
          active={activePage === id}
          onClick={() => setActivePage(id)}
          badge={id === 'news' ? news.length || null : null}
        />
      ))}

      <div className="h-px bg-border my-1 mx-0 flex-shrink-0"/>
      <div className="px-3 pt-2 pb-1 font-mono text-[8px] font-medium tracking-[.14em] text-text-3 uppercase flex-shrink-0">
        {t.assets}
      </div>

      {PAGES.slice(4).map(({ id, icon: Icon }) => (
        <NavItem
          key={id}
          id={id}
          label={t[id]}
          icon={<Icon />}
          active={activePage === id}
          onClick={() => setActivePage(id)}
        />
      ))}

      <div className="mt-auto p-3 border-t border-border">
        <div className="font-mono text-[8px] text-text-3">ARNSAFAROV v1.0 · LIVE</div>
      </div>
    </div>
  )
}

function NavItem({ id, label, icon, active, onClick, badge }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: '#161d2a' }}
      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors select-none flex-shrink-0
        border-l-2 ${active ? 'border-blue-500 bg-bg-3 text-text-1' : 'border-transparent text-text-2 hover:text-text-1'}`}
    >
      <span className={`flex-shrink-0 ${active ? 'opacity-100' : 'opacity-60'}`}>{icon}</span>
      <span className="text-[11px] font-medium flex-1">{label}</span>
      {badge && (
        <span className="font-mono text-[9px] text-text-3 bg-bg-4 px-1 rounded">{badge}</span>
      )}
    </motion.div>
  )
}

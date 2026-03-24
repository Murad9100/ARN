import React from 'react'
import { useStore } from './store'
import { useWebSocket } from './hooks/useWebSocket'
import { usePrices } from './hooks/usePrices'
import { useNews } from './hooks/useNews'
import Topbar from './components/Topbar'
import Ticker from './components/Ticker'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import NewsPage from './pages/NewsPage'
import Signals from './pages/Signals'
import Watchlist from './pages/Watchlist'
import Settings from './pages/Settings'

const PAGES = {
  dashboard: Dashboard,
  markets: Markets,
  news: NewsPage,
  signals: Signals,
  watchlist: Watchlist,
  settings: Settings,
}

export default function App() {
  const activePage = useStore(s => s.activePage)

  // Global data hooks
  useWebSocket()
  usePrices()
  useNews()

  const PageComponent = PAGES[activePage] || Dashboard

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0b0f14' }}>
      <Topbar />
      <Ticker />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <PageComponent />
        <RightPanel />
      </div>
    </div>
  )
}

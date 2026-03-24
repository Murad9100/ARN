import { useEffect } from 'react'
import { useStore } from '../store'
import { fetchNews } from '../utils/api'

export function useNews() {
  const setNews = useStore(s => s.setNews)
  const setNewsLastUpdated = useStore(s => s.setNewsLastUpdated)

  async function load() {
    try {
      const data = await fetchNews({ limit: 50 })
      if (data.items) {
        setNews(data.items)
        setNewsLastUpdated(data.lastFetched)
      }
    } catch (e) {
      console.warn('[useNews]', e.message)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10 * 60 * 1000) // 10 min
    return () => clearInterval(interval)
  }, [])

  return { reload: load }
}

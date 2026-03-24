import { useEffect } from 'react'
import { useStore } from '../store'
import { fetchCrypto, fetchGlobal } from '../utils/api'

export function usePrices() {
  const setCoins = useStore(s => s.setCoins)
  const setGlobalStats = useStore(s => s.setGlobalStats)

  async function load() {
    try {
      const [coins, global] = await Promise.all([
        fetchCrypto(100),
        fetchGlobal(),
      ])
      setCoins(coins)
      setGlobalStats(global)
    } catch (e) {
      console.warn('[usePrices]', e.message)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000) // refresh every 60s
    return () => clearInterval(interval)
  }, [])
}

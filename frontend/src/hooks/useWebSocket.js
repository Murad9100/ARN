import { useEffect, useRef } from 'react'
import { useStore } from '../store'

export function useWebSocket() {
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const setLivePrices = useStore(s => s.setLivePrices)
  const setNews = useStore(s => s.setNews)
  const setWsConnected = useStore(s => s.setWsConnected)

  function connect() {
    // Bura birbaşa Render linkini qoyuruq ki, Vercel backend-i tapa bilsin
    const ws = new WebSocket('wss://arn-sd6r.onrender.com/ws')
    wsRef.current = ws

    ws.onopen = () => {
      setWsConnected(true)
      console.log('[WS] Connected to Render Backend')
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'price') {
          setLivePrices(msg.data)
        } else if (msg.type === 'news') {
          setNews(msg.data)
        }
      } catch (err) {
        console.error('[WS] Message error:', err)
      }
    }

    ws.onclose = () => {
      setWsConnected(false)
      console.log('[WS] Disconnected. Reconnecting in 4s...')
      clearTimeout(reconnectRef.current)
      reconnectRef.current = setTimeout(connect, 4000)
    }

    ws.onerror = (err) => {
      console.error('[WS] Socket error:', err)
      ws.close()
    }
  }

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])
}

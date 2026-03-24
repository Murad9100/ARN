import { useEffect, useRef } from 'react'
import { useStore } from '../store'

export function useWebSocket() {
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const setLivePrices = useStore(s => s.setLivePrices)
  const setNews = useStore(s => s.setNews)
  const setWsConnected = useStore(s => s.setWsConnected)

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const ws = new WebSocket(`${protocol}//${host}/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsConnected(true)
      console.log('[WS] Connected')
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'price') {
          setLivePrices(msg.data)
        } else if (msg.type === 'news') {
          setNews(msg.data)
        }
      } catch (err) {}
    }

    ws.onclose = () => {
      setWsConnected(false)
      console.log('[WS] Disconnected. Reconnecting...')
      clearTimeout(reconnectRef.current)
      reconnectRef.current = setTimeout(connect, 4000)
    }

    ws.onerror = () => {
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

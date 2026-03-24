import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { useT } from '../utils/translations'

function FlagAZ() {
  return (
    <svg viewBox="0 0 30 20" className="w-5 h-3 rounded-sm">
      <rect width="30" height="6.66" y="0" fill="#0092BC"/>
      <rect width="30" height="6.68" y="6.66" fill="#E8112D"/>
      <rect width="30" height="6.66" y="13.34" fill="#00AF66"/>
      <circle cx="14.2" cy="10" r="3" fill="white"/>
      <circle cx="15.4" cy="10" r="2.3" fill="#E8112D"/>
      <g transform="translate(18.2,10)" fill="white">
        <polygon points="0,-1.4 0.33,-0.45 1.33,0 0.33,0.45 0,1.4 -0.33,0.45 -1.33,0 -0.33,-0.45"/>
        <polygon points="0,-1.4 0.33,-0.45 1.33,0 0.33,0.45 0,1.4 -0.33,0.45 -1.33,0 -0.33,-0.45" transform="rotate(45)"/>
      </g>
    </svg>
  )
}

function FlagRU() {
  return (
    <svg viewBox="0 0 30 20" className="w-5 h-3 rounded-sm">
      <rect width="30" height="6.67" y="0" fill="#fff"/>
      <rect width="30" height="6.67" y="6.67" fill="#0033A0"/>
      <rect width="30" height="6.67" y="13.33" fill="#CC0000"/>
    </svg>
  )
}

function FlagEN() {
  return (
    <svg viewBox="0 0 60 30" className="w-5 h-3 rounded-sm">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )
}

export default function Topbar() {
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const wsConnected = useStore(s => s.wsConnected)
  const t = useT(lang)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      
      // İstifadəçinin cihazındakı yerli vaxtı götürür
      const localTime = now.toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      // Cihazın yerləşdiyi şəhəri tapır (Məs: Baku, Istanbul, New_York)
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1] || 'LOCAL'
      
      // Terminal stili üçün təmizləmə (Alt xəttləri boşluqla əvəz edir)
      setClock(`${localTime} ${zone.replace('_', ' ').toUpperCase()}`)
    }
    
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const flags = [
    { code: 'az', Flag: FlagAZ },
    { code: 'ru', Flag: FlagRU },
    { code: 'en', Flag: FlagEN },
  ]

  return (
    <div className="h-9 bg-bg-1 border-b border-border flex items-center px-3 gap-3 flex-shrink-0 z-20">
      <span className="font-mono text-[11px] tracking-[.2em] text-text-2">
        <span className="text-text-1 font-medium">ARNSAFAROV</span> TERMINAL
      </span>
      <div className="w-px h-3.5 bg-border-2"/>
      
      {/* Dinamik Saat Bölməsi */}
      <span className="font-mono text-[10px] text-text-3 min-w-[120px]">{clock}</span>
      
      <div className="flex items-center gap-1">
        <motion.div
          animate={{ opacity: wsConnected ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          className="w-1.5 h-1.5 rounded-full bg-green-400"
          style={{ animation: wsConnected ? 'pulseDot 1.5s infinite' : 'none' }}
        />
        <span className="font-mono text-[9px] text-green-400 tracking-widest">{t.live}</span>
      </div>

      <div className="ml-auto flex">
        {flags.map(({ code, Flag }) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`h-9 px-2.5 border-l border-border flex items-center transition-colors ${
              lang === code ? 'bg-bg-3' : 'hover:bg-bg-2'
            }`}
            style={{ position: 'relative' }}
          >
            <Flag />
            {lang === code && (
              <motion.div
                layoutId="lang-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

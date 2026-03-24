import React from 'react'
import { useStore } from '../store'
import { useT } from '../utils/translations'

export default function Settings() {
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const t = useT(lang)

  const langs = [
    { code: 'az', label: 'Azərbaycan' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ]

  const sources = [
    { name: 'CoinGecko API', desc: 'Kripto qiymətlər · hər 60 saniyə', status: 'active' },
    { name: 'Binance WebSocket', desc: 'Real-time qiymət axını · canlı', status: 'active' },
    { name: 'CoinDesk RSS', desc: 'Kripto xəbərləri · hər 10 dəq', status: 'active' },
    { name: 'CoinTelegraph RSS', desc: 'Kripto xəbərləri · hər 10 dəq', status: 'active' },
    { name: 'NewsAPI', desc: 'Geniş maliyyə xəbərləri · API açarı lazımdır', status: 'optional' },
    { name: 'OpenAI API', desc: 'AI analiz · API açarı lazımdır', status: 'optional' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-9 bg-bg-1 border-b border-border flex items-center px-3">
        <span className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase">{t.settings}</span>
      </div>

      <div className="max-w-xl p-4 space-y-6">

        {/* Language */}
        <section>
          <div className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase mb-3">{t.lang}</div>
          <div className="flex gap-2">
            {langs.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-4 py-2 text-[11px] rounded border transition-all
                  ${lang === l.code
                    ? 'border-blue-700 bg-blue-900/30 text-text-1'
                    : 'border-border bg-bg-2 text-text-2 hover:border-border-2 hover:text-text-1'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section>
          <div className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase mb-3">Data Sources</div>
          <div className="space-y-2">
            {sources.map(s => (
              <div key={s.name} className="flex items-center justify-between px-3 py-2.5 bg-bg-2 border border-border rounded">
                <div>
                  <div className="text-[11px] font-medium text-text-1">{s.name}</div>
                  <div className="text-[9px] text-text-3 font-mono mt-0.5">{s.desc}</div>
                </div>
                <span className={`font-mono text-[9px] font-semibold
                  ${s.status === 'active' ? 'text-green-400' : 'text-amber-400'}`}>
                  {s.status === 'active' ? '● AKTİV' : '● OPSİYONAL'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys note */}
        <section>
          <div className="font-mono text-[8px] font-semibold tracking-widest text-text-3 uppercase mb-3">API Keys (.env)</div>
          <div className="bg-bg-2 border border-border rounded p-3 font-mono text-[10px] text-text-2 space-y-1">
            <div><span className="text-text-3"># backend/.env</span></div>
            <div>NEWS_API_KEY=<span className="text-amber-400">your_key</span></div>
            <div>OPENAI_API_KEY=<span className="text-amber-400">your_key</span></div>
            <div className="text-text-3 mt-2"># Kripto qiymətlər açarsız işləyir</div>
          </div>
        </section>

        <div className="text-[9px] text-text-3 font-mono pt-2 border-t border-border">
          ARNSAFAROV TERMINAL v1.0 · {t.disc}
        </div>
      </div>
    </div>
  )
}

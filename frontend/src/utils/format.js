export function fmtPrice(p) {
  if (p == null) return '—'
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (p >= 1) return '$' + p.toFixed(2)
  if (p >= 0.01) return '$' + p.toFixed(4)
  return '$' + p.toFixed(6)
}

export function fmtPct(p) {
  if (p == null) return '—'
  const sign = p >= 0 ? '+' : ''
  return sign + p.toFixed(2) + '%'
}

export function fmtLarge(n) {
  if (!n) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M'
  return '$' + n.toFixed(0)
}

export function timeAgo(dateStr, lang = 'az') {
  if (!dateStr) return '—'
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  const labels = {
    az: { now: 'İndi', min: 'dəq əvvəl', hr: 'saat əvvəl', day: 'gün əvvəl' },
    ru: { now: 'Только что', min: 'мин назад', hr: 'ч назад', day: 'д назад' },
    en: { now: 'Just now', min: 'min ago', hr: 'h ago', day: 'd ago' },
  }
  const l = labels[lang] || labels.en
  if (diff < 60) return l.now
  if (diff < 3600) return Math.floor(diff / 60) + ' ' + l.min
  if (diff < 86400) return Math.floor(diff / 3600) + ' ' + l.hr
  return Math.floor(diff / 86400) + ' ' + l.day
}

export function signalColor(signal) {
  if (!signal) return 'text-text-2'
  if (signal === 'BUY') return 'text-green-400'
  if (signal === 'SELL') return 'text-red-400'
  return 'text-amber-400'
}

export function signalBg(signal) {
  if (!signal) return 'bg-bg-4'
  if (signal === 'BUY') return 'bg-green-900/30 border-green-700/40'
  if (signal === 'SELL') return 'bg-red-900/30 border-red-700/40'
  return 'bg-amber-900/30 border-amber-700/40'
}

export function impactColor(impact) {
  if (impact === 'HIGH') return 'text-red-400'
  if (impact === 'MEDIUM') return 'text-amber-400'
  return 'text-text-3'
}

export function chgColor(val) {
  if (val == null) return 'text-text-2'
  return val >= 0 ? 'text-green-400' : 'text-red-400'
}

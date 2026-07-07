import { useState, useMemo } from 'react'

const PAGE_SIZE = 100

function computeDistrictAvg(data) {
  // avg price_m2 per seher group
  const groups = {}
  data.forEach(row => {
    const areaVal = parseFloat((row.area || '').replace(/[^\d.]/g, ''))
    const pm2 = (row.price_num && areaVal) ? row.price_num / areaVal : null
    if (!pm2) return
    const key = row.seher || '__global__'
    if (!groups[key]) groups[key] = []
    groups[key].push(pm2)
  })
  const avgs = {}
  let globalSum = 0, globalN = 0
  Object.entries(groups).forEach(([k, vals]) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length
    avgs[k] = avg
    globalSum += vals.reduce((a, b) => a + b, 0)
    globalN += vals.length
  })
  avgs['__global__'] = globalN ? globalSum / globalN : 0
  return avgs
}

function deviationPct(pm2, avg) {
  if (!pm2 || !avg) return null
  return Math.round((pm2 - avg) / avg * 100)
}

export default function EmlakTable({ data, mode = 'all' }) {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('first_seen')
  const [sortDir, setSortDir] = useState('desc')

  // district averages computed from the current filtered set
  const districtAvg = useMemo(() => computeDistrictAvg(data), [data])
  const globalAvg = districtAvg['__global__'] || 0

  const withM2 = useMemo(() => data.map(row => {
    const areaVal = parseFloat((row.area || '').replace(/[^\d.]/g, ''))
    const pm2 = (row.price_num && areaVal) ? Math.round(row.price_num / areaVal) : null
    const avg = districtAvg[row.seher || '__global__'] || globalAvg
    const dev = deviationPct(pm2, avg)
    return { ...row, price_m2: pm2, dev }
  }), [data, districtAvg, globalAvg])

  const displayed = useMemo(() => {
    setPage(1)
    return mode === 'best' ? withM2.filter(r => r.dev !== null && r.dev <= -15) : withM2
  }, [withM2, mode])

  const sorted = useMemo(() => [...displayed].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (['price_num', 'price_m2', 'views', 'dev'].includes(sortKey)) {
      return sortDir === 'desc' ? (bv || 0) - (av || 0) : (av || 0) - (bv || 0)
    }
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv))
  }), [displayed, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const cols = [
    { key: 'views',         label: 'Baxış',   w: 55 },
    { key: 'title',         label: 'Başlıq',  w: 220 },
    { key: 'price_num',     label: 'Qiymət',  w: 85 },
    { key: 'price_m2',      label: '₼/m²',    w: 65 },
    { key: 'dev',           label: 'Rayon %', w: 65 },
    { key: 'area',          label: 'Sahə',    w: 55 },
    { key: 'rooms',         label: 'Otaq',    w: 45 },
    { key: 'floor_info',    label: 'Mərtəbə', w: 65 },
    { key: 'yerleshme',     label: 'Yer',     w: 120 },
    { key: 'building_type', label: 'Tip',     w: 80 },
    { key: 'phone',         label: 'Telefon', w: 95 },
    { key: 'first_seen',    label: 'Tarix',   w: 90 },
  ]

  const thCls = "px-2 py-1 text-left text-[#777] font-normal cursor-pointer hover:text-[#bbb] whitespace-nowrap select-none"
  const tdCls = "px-2 py-0.5 whitespace-nowrap overflow-hidden"

  function rowBg(dev) {
    if (dev === null) return ''
    if (dev <= -15) return 'bg-[#0d1f0d]'   // green tint
    if (dev >= 15)  return 'bg-[#1f0d0d]'   // red tint
    return ''
  }

  function devLabel(dev) {
    if (dev === null) return '—'
    const sign = dev > 0 ? '+' : ''
    return sign + dev + '%'
  }

  function devColor(dev) {
    if (dev === null) return 'text-[#444]'
    if (dev <= -15) return 'text-[#4caf50] font-medium'
    if (dev >= 15)  return 'text-[#e57373]'
    return 'text-[#666]'
  }

  return (
    <div>
      {/* District avg info bar */}
      <div className="flex gap-4 mb-1.5 text-[#666] flex-wrap" style={{ fontSize: 10 }}>
        <span>Orta ₼/m²: <span className="text-[#999]">{Math.round(globalAvg).toLocaleString()} ₼</span></span>
        <span className="text-[#444]">·</span>
        <span className="text-[#4caf50]">■ &lt;−15% ucuz</span>
        <span className="text-[#e57373]">■ &gt;+15% baha</span>
        <span className="text-[#444]">· rayon ortalamasına görə</span>
      </div>

      <div className="overflow-x-auto border border-[#1a1a1a] rounded" style={{ fontSize: 11 }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
              <th className="px-2 py-1 text-left text-[#555] font-normal w-8">#</th>
              {cols.map(c => (
                <th key={c.key} className={thCls} style={{ width: c.w, maxWidth: c.w }}
                  onClick={() => toggleSort(c.key)}>
                  {c.label}{sortKey === c.key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-[#141414] hover:brightness-125 ${rowBg(row.dev)}`}>
                <td className="px-2 py-0.5 text-[#333]">{(page - 1) * PAGE_SIZE + i + 1}</td>
                {cols.map(c => (
                  <td key={c.key} className={tdCls} style={{ maxWidth: c.w }}>
                    {c.key === 'title' ? (
                      <a href={row.url} target="_blank" rel="noreferrer"
                        className="text-[#aaa] hover:text-[#e0e0e0] truncate block" style={{ maxWidth: c.w }}
                        title={row.description || row.title}>
                        {row.description
                          ? row.description.trim().split(/\s+/).slice(0, 4).join(' ')
                          : (row.title || '—')}
                      </a>
                    ) : c.key === 'views' ? (
                      row.views
                        ? <span className="text-[#6ba3d6] font-medium">{row.views.toLocaleString()}</span>
                        : <span className="text-[#555]">—</span>
                    ) : c.key === 'dev' ? (
                      <span className={devColor(row.dev)}>{devLabel(row.dev)}</span>
                    ) : c.key === 'floor_info' ? (() => {
                      const f = row.floor_num, t = row.floor_total
                      if (!f || !t) return <span className="text-[#333]">—</span>
                      const bad = f === 1 || f === t
                      return <span className={bad ? 'text-[#c8763a]' : 'text-[#4caf50]'}>{f}/{t}</span>
                    })() : c.key === 'price_m2' ? (
                      <span className="text-[#888]">{row.price_m2 ? row.price_m2.toLocaleString() + ' ₼' : '—'}</span>
                    ) : c.key === 'price_num' ? (
                      <span className="text-[#aaa]">{row.price_num ? row.price_num.toLocaleString() + ' ₼' : '—'}</span>
                    ) : c.key === 'first_seen' ? (
                      <span className="text-[#555]">{(row.first_seen || '').slice(0, 10)}</span>
                    ) : (
                      <span className="text-[#aaa] truncate block" style={{ maxWidth: c.w }}>{row[c.key] || '—'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-1.5 mt-2 items-center text-[#444]" style={{ fontSize: 11 }}>
          <button className="px-2 py-0.5 border border-[#1e1e1e] rounded hover:text-[#c9c9c9] disabled:opacity-20"
            disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
          <span>{page} / {totalPages}</span>
          <button className="px-2 py-0.5 border border-[#1e1e1e] rounded hover:text-[#c9c9c9] disabled:opacity-20"
            disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
          <span className="ml-1 text-[#333]">{displayed.length.toLocaleString()} elan</span>
        </div>
      )}
    </div>
  )
}

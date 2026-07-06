import { useState } from 'react'

const PAGE_SIZE = 100

export default function ProductTable({ data }) {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('views')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = [...data].sort((a, b) => {
    const av = sortKey === 'views' ? (a.views || 0) : (a[sortKey] || '')
    const bv = sortKey === 'views' ? (b.views || 0) : (b[sortKey] || '')
    if (typeof av === 'number') return sortDir === 'desc' ? bv - av : av - bv
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv))
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const cols = [
    { key: 'views',        label: 'Baxış',    w: 60 },
    { key: 'Bashliq',      label: 'Başlıq',   w: 260 },
    { key: 'Qiymet',       label: 'Qiymət',   w: 80 },
    { key: 'Marka',        label: 'Marka',    w: 80 },
    { key: 'Qosulma novu', label: 'Növ',      w: 70 },
    { key: 'Satici',       label: 'Satıcı',   w: 65 },
    { key: 'Telefon',      label: 'Telefon',  w: 90 },
    { key: 'Tarix',        label: 'Tarix',    w: 110 },
  ]

  const thCls = "px-2 py-1 text-left text-[#444] font-normal cursor-pointer hover:text-[#888] whitespace-nowrap select-none"
  const tdCls = "px-2 py-0.5 text-[#aaa] whitespace-nowrap overflow-hidden"

  return (
    <div>
      <div className="overflow-x-auto border border-[#1a1a1a] rounded" style={{ fontSize: 11 }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
              <th className="px-2 py-1 text-left text-[#333] font-normal w-8">#</th>
              {cols.map(c => (
                <th
                  key={c.key}
                  className={thCls}
                  style={{ width: c.w, maxWidth: c.w }}
                  onClick={() => toggleSort(c.key)}
                >
                  {c.label}{sortKey === c.key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[#141414] hover:bg-[#141414]"
              >
                <td className="px-2 py-0.5 text-[#333]">{(page - 1) * PAGE_SIZE + i + 1}</td>
                {cols.map(c => (
                  <td key={c.key} className={tdCls} style={{ maxWidth: c.w }}>
                    {c.key === 'Bashliq' ? (
                      <a
                        href={row['Link']}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#e0e0e0] truncate block"
                        style={{ maxWidth: c.w }}
                      >
                        {row[c.key] || '—'}
                      </a>
                    ) : c.key === 'views' ? (
                      <span className="text-[#6ba3d6] font-medium">{(row.views || 0).toLocaleString()}</span>
                    ) : (
                      <span className="truncate block" style={{ maxWidth: c.w }}>{row[c.key] || '—'}</span>
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
          <button
            className="px-2 py-0.5 border border-[#1e1e1e] rounded hover:text-[#c9c9c9] disabled:opacity-20"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >←</button>
          <span>{page} / {totalPages}</span>
          <button
            className="px-2 py-0.5 border border-[#1e1e1e] rounded hover:text-[#c9c9c9] disabled:opacity-20"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >→</button>
          <span className="ml-1 text-[#333]">{data.length.toLocaleString()} elan</span>
        </div>
      )}
    </div>
  )
}

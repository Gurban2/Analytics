import { useState, useMemo, useCallback } from 'react'
import products from '../data/products.json'
import emlakData from '../data/emlak.json'
import Filters from '../components/Filters'
import ProductTable from '../components/ProductTable'
import EmlakTable from '../components/EmlakTable'

const SEHER_OPTIONS = (() => {
  const counts = {}
  emlakData.forEach(d => { if (d.seher) counts[d.seher] = (counts[d.seher] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k)
})()

const TABS = [
  { key: 'all',        label: 'Hamısı' },
  { key: 'headphones', label: 'Qulaqlıqlar' },
  { key: 'evler',      label: 'Evlər' },
  { key: 'emlak',      label: 'Mənzillər' },
]

export default function Dashboard() {
  const [tab, setTab] = useState('all')
  const [filters, setFilters] = useState({ brand: '', connection: '', seller: '', search: '' })
  const [emlakSearch, setEmlakSearch] = useState('')
  const [emlakRooms, setEmlakRooms] = useState('')
  const [emlakSeher, setEmlakSeher] = useState('')
  const [emlakMode, setEmlakMode] = useState('all')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  const triggerUpdate = useCallback(async () => {
    setUpdating(true)
    setUpdateMsg('Yenilənir...')
    try {
      const res = await fetch('http://localhost:5174/api/update', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'busy') { setUpdateMsg('Artıq işləyir...'); setUpdating(false); return }
      const poll = setInterval(async () => {
        const s = await fetch('http://localhost:5174/api/status').then(r => r.json())
        if (s.status === 'done') {
          clearInterval(poll)
          setUpdateMsg('+' + s.added + ' yeni elan (' + s.total + ' cəmi)')
          setUpdating(false)
        } else if (s.status === 'error') {
          clearInterval(poll)
          setUpdateMsg('Xəta: ' + s.message)
          setUpdating(false)
        }
      }, 3000)
    } catch {
      setUpdateMsg('API server işləmir (python api_server.py)')
      setUpdating(false)
    }
  }, [])

  const tabFiltered = useMemo(() => {
    if (tab === 'headphones') return products.filter(p => p.is_headphone)
    if (tab === 'evler')      return products.filter(p => p.category === 'evler')
    return products
  }, [tab])

  const filtered = useMemo(() => {
    return tabFiltered.filter(p => {
      if (filters.brand && p['Marka'] !== filters.brand) return false
      if (filters.connection && p['Qosulma novu'] !== filters.connection) return false
      if (filters.seller && p['Satici'] !== filters.seller) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!(p['Bashliq'] || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [tabFiltered, filters])

  const filteredEmlak = useMemo(() => {
    return emlakData.filter(p => {
      if (emlakRooms && p.rooms !== emlakRooms) return false
      if (emlakSeher && p.seher !== emlakSeher) return false
      if (emlakSearch) {
        const q = emlakSearch.toLowerCase()
        if (!(p.title || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [emlakSearch, emlakRooms, emlakSeher])

  const isEmlak = tab === 'emlak'

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#c9c9c9]" style={{ fontSize: 11 }}>
      <header className="border-b border-[#1e1e1e] px-3 py-1.5 flex items-center gap-3">
        <span className="text-white font-medium" style={{ fontSize: 12 }}>tap.az</span>
        <span className="text-[#333]">|</span>
        {isEmlak
          ? <span className="text-[#444]">Mənzillər · Bakı · {emlakData.length.toLocaleString()} elan</span>
          : <span className="text-[#444]">Audio-Video · {products.length.toLocaleString()} elan</span>
        }
        <span className="text-[#333] ml-auto">
          {isEmlak ? filteredEmlak.length.toLocaleString() : filtered.length.toLocaleString()} nəticə
        </span>
      </header>

      <div className="border-b border-[#1a1a1a] px-3 flex gap-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 border-b-2 transition-colors ${
              tab === t.key ? 'border-[#6ba3d6] text-white' : 'border-transparent text-[#444] hover:text-[#888]'
            }`} style={{ fontSize: 11 }}>
            {t.label}
            {t.key === 'headphones' && (
              <span className="ml-1.5 text-[#333]">{products.filter(p => p.is_headphone).length.toLocaleString()}</span>
            )}
            {t.key === 'emlak' && (
              <span className="ml-1.5 text-[#333]">{emlakData.length.toLocaleString()}</span>
            )}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 space-y-2">
        {isEmlak ? (
          <>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                className="bg-[#111] border border-[#1e1e1e] rounded px-2 py-0.5 text-[#c9c9c9] placeholder-[#333] focus:outline-none focus:border-[#444] w-32"
                placeholder="Axtar..." value={emlakSearch}
                onChange={e => setEmlakSearch(e.target.value)}
                style={{ fontSize: 11 }}
              />
              <select
                className="bg-[#111] border border-[#1e1e1e] rounded px-2 py-0.5 text-[#c9c9c9] focus:outline-none focus:border-[#444]"
                value={emlakSeher} onChange={e => setEmlakSeher(e.target.value)}
                style={{ fontSize: 11 }}
              >
                <option value="">Rayon</option>
                {SEHER_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {['', '1', '2', '3', '4'].map(r => (
                <button key={r}
                  onClick={() => setEmlakRooms(r)}
                  className={`px-2 py-0.5 border rounded ${emlakRooms === r ? 'border-[#6ba3d6] text-white' : 'border-[#1e1e1e] text-[#555] hover:text-[#c9c9c9]'}`}
                  style={{ fontSize: 11 }}
                >
                  {r === '' ? 'Hamısı' : r + ' otaq'}
                </button>
              ))}
              <button
                onClick={() => {
                  if (window.confirm('Yenilə başladılsın?\n\nDiqqət: bu proses 5–15 dəqiqə çəkə bilər (yeni elanlar çox olarsa 1–2 saat). Brauzer pəncərəsini bağlamayın.')) {
                    triggerUpdate()
                  }
                }}
                disabled={updating}
                className="px-2 py-0.5 border border-[#1e1e1e] rounded text-[#555] hover:text-[#c9c9c9] disabled:opacity-40"
                style={{ fontSize: 11 }}
              >
                {updating ? '...' : 'Yenilə'}
              </button>
              {updateMsg && <span className="text-[#444]" style={{ fontSize: 11 }}>{updateMsg}</span>}
              <div className="ml-auto flex gap-1">
                {[['all', 'Hamısı'], ['best', 'Best Deal']].map(([m, label]) => (
                  <button key={m} onClick={() => setEmlakMode(m)}
                    className={`px-2 py-0.5 border rounded transition-colors ${
                      emlakMode === m
                        ? m === 'best' ? 'border-[#c8a228] text-[#c8a228]' : 'border-[#6ba3d6] text-white'
                        : 'border-[#1e1e1e] text-[#444] hover:text-[#888]'
                    }`}
                    style={{ fontSize: 11 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <EmlakTable data={filteredEmlak} mode={emlakMode} />
          </>
        ) : (
          <>
            <Filters filters={filters} onChange={setFilters} data={tabFiltered} />
            <ProductTable data={filtered} />
          </>
        )}
      </div>
    </div>
  )
}

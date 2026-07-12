import { useState, useMemo, useCallback } from 'react'
import emlakData from '../data/emlak.json'
import EmlakTable from '../components/EmlakTable'

function getSeherOptions(data) {
  const counts = {}
  data.forEach(d => { if (d.seher) counts[d.seher] = (counts[d.seher] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k)
}

const PRICE_RANGES = [
  { key: '100-200', label: '100k–200k', min: 100000, max: 200000 },
  { key: '50-80',   label: '50k–80k',  min: 50000,  max: 80000  },
]

export default function Dashboard() {
  const [priceRange, setPriceRange] = useState('100-200')
  const [activeSource, setActiveSource] = useState('all')
  const [emlakSearch, setEmlakSearch] = useState('')
  const [emlakRooms, setEmlakRooms] = useState('')
  const [emlakSeher, setEmlakSeher] = useState('')
  const [emlakMode, setEmlakMode] = useState('all')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')

  const priceData = useMemo(() => {
    const r = PRICE_RANGES.find(r => r.key === priceRange)
    return emlakData.filter(d => d.price_num >= r.min && d.price_num <= r.max)
  }, [priceRange])

  const sourceData = useMemo(
    () => activeSource === 'all' ? priceData : priceData.filter(d => (d.source || 'tap.az') === activeSource),
    [activeSource, priceData]
  )
  const seherOptions = useMemo(() => getSeherOptions(sourceData), [sourceData])

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

  const filteredEmlak = useMemo(() => {
    return sourceData.filter(p => {
      if (emlakRooms && p.rooms !== emlakRooms) return false
      if (emlakSeher && p.seher !== emlakSeher) return false
      if (emlakSearch) {
        const q = emlakSearch.toLowerCase()
        if (!(p.title || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [sourceData, emlakSearch, emlakRooms, emlakSeher])

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-[#c9c9c9]" style={{ fontSize: 11 }}>

      {/* Header */}
      <header className="border-b border-[#1e1e1e] px-4 py-1.5 flex items-center gap-3 flex-wrap">
        <span className="text-white font-semibold" style={{ fontSize: 13 }}>Emlak Analytics</span>
        <span className="text-[#333]">|</span>
        {/* Price range selector */}
        {PRICE_RANGES.map(r => (
          <button key={r.key} onClick={() => { setPriceRange(r.key); setActiveSource('all'); setEmlakMode('all'); setEmlakSeher(''); setEmlakSearch(''); setEmlakRooms('') }}
            className={`px-2 py-0.5 rounded transition-colors ${priceRange === r.key ? 'bg-[#1a2a1a] text-[#7cbf7c]' : 'text-[#555] hover:text-[#999]'}`}
            style={{ fontSize: 12 }}>
            {r.label}
          </button>
        ))}
        <span className="text-[#333]">|</span>
        {/* Source tabs */}
        {[['all', 'Hamısı', priceData.length], ['tap.az', 'tap.az', priceData.filter(d => (d.source||'tap.az')==='tap.az').length], ['bina.az', 'bina.az', priceData.filter(d => d.source==='bina.az').length]].map(([src, label, count]) => (
          <button key={src} onClick={() => { setActiveSource(src); setEmlakMode('all'); setEmlakSeher(''); setEmlakSearch(''); setEmlakRooms('') }}
            className={`px-2 py-0.5 rounded transition-colors ${activeSource === src ? 'bg-[#1e1e1e] text-white' : 'text-[#555] hover:text-[#999]'}`}
            style={{ fontSize: 12 }}>
            {label} <span className="text-[#444]">({count})</span>
          </button>
        ))}
        <span className="text-[#999] ml-1">· Bakı · Mənzillər</span>
        <span className="text-[#777] ml-auto">{filteredEmlak.length.toLocaleString()} nəticə</span>
      </header>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-[#1a1a1a] flex gap-2 items-center flex-wrap">
        <input
          className="bg-[#111] border border-[#1e1e1e] rounded px-2 py-0.5 text-[#c9c9c9] placeholder-[#333] focus:outline-none focus:border-[#444] w-36"
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
          {seherOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-1 flex-wrap">
          {['', '1', '2', '3', '4'].map(r => (
            <button key={r} onClick={() => setEmlakRooms(r)}
              className={`px-2 py-0.5 border rounded ${emlakRooms === r ? 'border-[#6ba3d6] text-white' : 'border-[#1e1e1e] text-[#555] hover:text-[#c9c9c9]'}`}
              style={{ fontSize: 11 }}>
              {r === '' ? 'Hamısı' : r + ' otaq'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto items-center flex-wrap">
          {updateMsg && <span className="text-[#444]">{updateMsg}</span>}
          <button
            onClick={() => {
              if (window.confirm('Yenilə başladılsın?\n\nDiqqət: bu proses 5–15 dəqiqə çəkə bilər. Brauzer pəncərəsini bağlamayın.')) {
                triggerUpdate()
              }
            }}
            disabled={updating}
            className="px-2 py-0.5 border border-[#1e1e1e] rounded text-[#555] hover:text-[#c9c9c9] disabled:opacity-40"
            style={{ fontSize: 11 }}>
            {updating ? '...' : 'Yenilə'}
          </button>
          <span className="text-[#222]">|</span>
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

      {/* Table */}
      <div className="px-4 py-2">
        <EmlakTable data={filteredEmlak} mode={emlakMode} />
      </div>
    </div>
  )
}

import { useMemo } from 'react'

const sel = "bg-[#111] border border-[#1e1e1e] rounded px-2 py-0.5 text-[#c9c9c9] focus:outline-none focus:border-[#444] cursor-pointer"

export default function Filters({ filters, onChange, data }) {
  const brands = useMemo(() => {
    const s = new Set(data.map(p => p['Marka']).filter(Boolean))
    return [...s].sort()
  }, [data])

  const connections = useMemo(() => {
    const s = new Set(data.map(p => p['Qosulma novu']).filter(Boolean))
    return [...s].sort()
  }, [data])

  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }))
  const active = filters.search || filters.brand || filters.connection || filters.seller

  return (
    <div className="flex flex-wrap gap-1.5 items-center" style={{ fontSize: 11 }}>
      <input
        className="bg-[#111] border border-[#1e1e1e] rounded px-2 py-0.5 text-[#c9c9c9] placeholder-[#333] focus:outline-none focus:border-[#444] w-40"
        placeholder="Axtar..."
        value={filters.search}
        onChange={e => set('search', e.target.value)}
        style={{ fontSize: 11 }}
      />

      <select className={sel} style={{ fontSize: 11 }} value={filters.brand} onChange={e => set('brand', e.target.value)}>
        <option value="">Marka</option>
        {brands.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <select className={sel} style={{ fontSize: 11 }} value={filters.connection} onChange={e => set('connection', e.target.value)}>
        <option value="">Qoşulma</option>
        {connections.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className={sel} style={{ fontSize: 11 }} value={filters.seller} onChange={e => set('seller', e.target.value)}>
        <option value="">Satıcı</option>
        <option value="Magaza">Mağaza</option>
        <option value="Ferdi">Fərdi</option>
      </select>

      {active && (
        <button
          className="px-2 py-0.5 text-[#555] hover:text-[#c9c9c9] border border-[#1e1e1e] rounded"
          style={{ fontSize: 11 }}
          onClick={() => onChange({ brand: '', connection: '', seller: '', search: '' })}
        >
          ✕ təmizlə
        </button>
      )}
    </div>
  )
}

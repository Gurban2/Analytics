export default function StatsCards({ data }) {
  const total = data.length
  const totalViews = data.reduce((s, p) => s + (p.views || 0), 0)
  const topItem = [...data].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
  const withPhone = data.filter(p => p['Telefon'] && p['Telefon'] !== '').length
  const avgViews = total ? Math.round(totalViews / total) : 0

  const cards = [
    { label: 'Elan', value: total.toLocaleString() },
    { label: 'Ümumi baxış', value: totalViews.toLocaleString() },
    { label: 'Orta baxış', value: avgViews.toLocaleString() },
    { label: 'Telefon var', value: withPhone.toLocaleString() },
    { label: 'Ən çox', value: topItem ? `${(topItem.views || 0).toLocaleString()} — ${(topItem['Bashliq'] || '').slice(0, 28)}` : '—' },
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {cards.map(c => (
        <div key={c.label} className="border border-[#1e1e1e] bg-[#111] px-3 py-1.5 rounded min-w-[100px]">
          <div className="text-[#444]" style={{ fontSize: 10 }}>{c.label}</div>
          <div className="text-white font-medium truncate max-w-[280px]" style={{ fontSize: 12 }}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

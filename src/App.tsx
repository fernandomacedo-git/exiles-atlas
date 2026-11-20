import { useMemo, useState } from 'react'

type Category = 'Gatherable' | 'Treasure' | 'Chest' | 'Weapon' | 'Relic' | 'Boss' | 'Recipe' | 'Event'
type PoiStatus = 'new' | 'seen' | 'collected'

interface Poi {
  id: number
  name: string
  category: Category
  x: number
  y: number
  status: PoiStatus
  note: string
}

const initialPois: Poi[] = [
  { id: 1, name: 'The Dregs', category: 'Relic', x: 43, y: 72, status: 'seen', note: 'Dungeon entrance; check for learned recipes.' },
  { id: 2, name: 'Bright Leviathan', category: 'Chest', x: 27, y: 38, status: 'new', note: '' },
  { id: 3, name: 'New Asagarth', category: 'Boss', x: 68, y: 31, status: 'seen', note: 'Heavy clan presence.' },
  { id: 4, name: 'Khari Treasure', category: 'Treasure', x: 58, y: 57, status: 'collected', note: 'Mountain route is safest.' },
  { id: 5, name: 'Iron Deposit', category: 'Gatherable', x: 36, y: 48, status: 'new', note: '' },
  { id: 6, name: 'Mounds of the Dead', category: 'Event', x: 49, y: 20, status: 'new', note: '' },
  { id: 7, name: 'Eyelet Cape Recipes', category: 'Recipe', x: 76, y: 68, status: 'new', note: '' },
]

const categories: Category[] = ['Gatherable', 'Treasure', 'Chest', 'Weapon', 'Relic', 'Boss', 'Recipe', 'Event']

export default function App() {
  const [pois, setPois] = useState(initialPois)
  const [selected, setSelected] = useState<Poi | null>(initialPois[0])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [showLive, setShowLive] = useState(false)

  const filtered = useMemo(() => pois.filter((poi) => {
    const matchesText = `${poi.name} ${poi.note}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = activeCategory === 'All' || poi.category === activeCategory
    return matchesText && matchesCategory
  }), [pois, query, activeCategory])

  const updatePoi = (id: number, patch: Partial<Poi>) => {
    setPois((current) => current.map((poi) => poi.id === id ? { ...poi, ...patch } : poi))
    setSelected((current) => current?.id === id ? { ...current, ...patch } : current)
  }

  const markStatus = (status: PoiStatus) => {
    if (selected) updatePoi(selected.id, { status })
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="brand">
          <div className="brand-mark">EA</div>
          <div>
            <h1>Exiles Atlas</h1>
            <p>Second-screen companion</p>
          </div>
        </header>

        <label className="search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search locations or notes" />
        </label>

        <div className="filters" aria-label="POI categories">
          {(['All', ...categories] as const).map((category) => (
            <button
              key={category}
              className={activeCategory === category ? 'filter active' : 'filter'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="location-list">
          <div className="list-heading"><span>Locations</span><b>{filtered.length}</b></div>
          {filtered.map((poi) => (
            <button
              key={poi.id}
              className={selected?.id === poi.id ? 'location selected' : 'location'}
              onClick={() => setSelected(poi)}
            >
              <span className={`status-dot ${poi.status}`} />
              <span><strong>{poi.name}</strong><small>{poi.category}</small></span>
              <em>{poi.status}</em>
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Exiled Lands</span>
            <h2>Region Map</h2>
          </div>
          <button className={showLive ? 'live enabled' : 'live'} onClick={() => setShowLive((value) => !value)}>
            <span /> {showLive ? 'Live tracking on' : 'Connect live position'}
          </button>
        </header>

        <div className="map-area">
          <div className="map-grid" role="img" aria-label="Stylized Exiled Lands map">
            <div className="terrain terrain-one" />
            <div className="terrain terrain-two" />
            <div className="terrain terrain-three" />
            {filtered.map((poi) => (
              <button
                key={poi.id}
                title={poi.name}
                className={`poi-marker ${poi.category.toLowerCase()} ${selected?.id === poi.id ? 'selected' : ''}`}
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                onClick={() => setSelected(poi)}
              >
                <span>{poi.category === 'Boss' ? '†' : poi.category === 'Chest' ? '◆' : '●'}</span>
              </button>
            ))}
            {showLive && <div className="player-marker" style={{ left: '51%', top: '63%' }}><span /></div>}
            <div className="coordinates">X 51 · Y 63 · Z 26</div>
          </div>
        </div>

        {selected && (
          <aside className="details">
            <button className="close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <span className="detail-category">{selected.category}</span>
            <h3>{selected.name}</h3>
            <p className="detail-status"><span className={`status-dot ${selected.status}`} /> {selected.status}</p>
            <label>
              Personal notes
              <textarea
                value={selected.note}
                onChange={(event) => updatePoi(selected.id, { note: event.target.value })}
                placeholder="Add a route, item, or reminder…"
              />
            </label>
            <div className="status-actions">
              <button onClick={() => markStatus('new')}>New</button>
              <button onClick={() => markStatus('seen')}>Seen</button>
              <button onClick={() => markStatus('collected')}>Collected</button>
            </div>
          </aside>
        )}
      </section>
    </main>
  )
}

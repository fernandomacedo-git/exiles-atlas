import { useEffect, useMemo, useRef, useState } from 'react'
import { categoryNames, initialPois } from './data/pois'
import { LivePositionBridge } from './lib/liveBridge'
import { loadPois, savePois } from './lib/storage'
import type { Category, LivePosition, Poi, PoiStatus } from './types'

export default function App() {
  const [pois, setPois] = useState<Poi[]>(() => loadPois(initialPois))
  const [selected, setSelected] = useState<Poi | null>(() => loadPois(initialPois)[0])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [position, setPosition] = useState<LivePosition | null>(null)
  const [bridgeError, setBridgeError] = useState(false)
  const bridgeRef = useRef<LivePositionBridge | null>(null)

  useEffect(() => savePois(pois), [pois])

  useEffect(() => () => {
    bridgeRef.current?.disconnect()
  }, [])

  const filtered = useMemo(() => pois.filter((poi) => {
    const matchesText = `${poi.name} ${poi.note}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = activeCategory === 'All' || poi.category === activeCategory
    return matchesText && matchesCategory
  }), [pois, query, activeCategory])

  const updatePoi = (id: string, patch: Partial<Poi>) => {
    setPois((current) => current.map((poi) => poi.id === id ? { ...poi, ...patch } : poi))
    setSelected((current) => current?.id === id ? { ...current, ...patch } : current)
  }

  const markStatus = (status: PoiStatus) => {
    if (selected) updatePoi(selected.id, { status })
  }

  const toggleLive = () => {
    if (bridgeRef.current) {
      bridgeRef.current.disconnect()
      bridgeRef.current = null
      setPosition(null)
      setBridgeError(false)
      return
    }

    const bridgeUrl = 'ws://127.0.0.1:7811/exiles-atlas'
    setBridgeError(false)
    const bridge = new LivePositionBridge(
      bridgeUrl,
      setPosition,
      () => setBridgeError(true),
    )
    bridgeRef.current = bridge
    bridge.connect()
  }

  const isLive = Boolean(position && Date.now() - position.updatedAt < 5000)

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
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search locations or notes" />
        </label>

        <div className="filters" aria-label="POI categories">
          {(['All', ...categoryNames] as const).map((category) => (
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
          <button className={position ? 'live enabled' : 'live'} onClick={toggleLive}>
            <span /> {position ? 'Live position on' : bridgeError ? 'Retry live position' : 'Connect live position'}
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
            {position && (
              <div className={isLive ? 'player-marker' : 'player-marker stale'} style={{ left: '51%', top: '63%' }}>
                <span />
              </div>
            )}
            <div className="coordinates">
              {position ? `X ${position.x.toFixed(1)} · Y ${position.y.toFixed(1)} · Z ${position.z.toFixed(1)}${isLive ? '' : ' · stale'}` : 'No live position'}
            </div>
          </div>
        </div>

        {selected && (
          <aside className="details">
            <button className="close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <span className="detail-category">{selected.category}</span>
            <h3>{selected.name}</h3>
            {selected.source && <p className="detail-source">Source: {selected.source}</p>}
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

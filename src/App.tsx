import { useEffect, useMemo, useRef, useState } from 'react'
import { categoryNames, initialPois } from './data/pois'
import { LivePositionBridge } from './lib/liveBridge'
import { loadPois, savePois } from './lib/storage'
import { mergeDataPack, parseDataPack } from './lib/dataPacks'
import { DEFAULT_CALIBRATION, mapWorldPosition, loadCalibration, saveCalibration } from './lib/mapCalibration'
import type { BridgeState } from './lib/liveBridge'
import type { MapCalibration } from './lib/mapCalibration'
import type { Category, LivePosition, Poi, PoiStatus } from './types'

export default function App() {
  const [pois, setPois] = useState<Poi[]>(() => loadPois(initialPois))
  const [selected, setSelected] = useState<Poi | null>(() => loadPois(initialPois)[0])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All')
  const [position, setPosition] = useState<LivePosition | null>(null)
  const [bridgeState, setBridgeState] = useState<BridgeState>('disconnected')
  const [clock, setClock] = useState(Date.now())
  const [calibration, setCalibration] = useState<MapCalibration>(() => loadCalibration())
  const [calibrationDraft, setCalibrationDraft] = useState<MapCalibration>(() => loadCalibration())
  const [dataPackMessage, setDataPackMessage] = useState('')
  const bridgeRef = useRef<LivePositionBridge | null>(null)
  const importRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => savePois(pois), [pois])

  useEffect(() => {
    if (!position) return
    const timer = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [Boolean(position)])

  useEffect(() => () => bridgeRef.current?.disconnect(), [])

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
      return
    }

    const bridge = new LivePositionBridge(
      'ws://127.0.0.1:7811/exiles-atlas',
      (nextPosition) => {
        setPosition(nextPosition)
        setClock(Date.now())
      },
      (state) => {
        setBridgeState(state)
        if (state === 'disconnected' || state === 'error') setPosition(null)
        if (state === 'disconnected' || state === 'error') bridgeRef.current = null
      },
      (poiId) => {
        setPois((current) => current.map((poi) => poi.id === poiId ? { ...poi, status: 'seen' } : poi))
        setSelected((current) => current?.id === poiId ? { ...current, status: 'seen' } : current)
      },
    )
    bridgeRef.current = bridge
    bridge.connect()
  }

  const importDataPack = async (file?: File) => {
    if (!file) return
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Data pack exceeds the 2 MB limit.')
      const pack = parseDataPack(await file.text())
      setPois((current) => mergeDataPack(current, pack))
      setDataPackMessage(`Imported “${pack.title}” (${pack.pois.length} locations).`)
    } catch (error) {
      setDataPackMessage(error instanceof Error ? error.message : 'Could not import this data pack.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const applyCalibration = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.values(calibrationDraft)
    if (!values.every(Number.isFinite) || calibrationDraft.maxX <= calibrationDraft.minX || calibrationDraft.maxY <= calibrationDraft.minY) {
      setDataPackMessage('Calibration requires finite values and max bounds greater than min bounds.')
      return
    }
    setCalibration(calibrationDraft)
    saveCalibration(calibrationDraft)
    setDataPackMessage('Map calibration saved.')
  }

  const marker = position ? mapWorldPosition(position, calibration) : null
  const isLive = Boolean(position && bridgeState === 'connected' && clock - position.updatedAt < 5000)
  const buttonLabel = bridgeState === 'connected'
    ? 'Disconnect live position'
    : bridgeState === 'connecting'
      ? 'Cancel connection'
      : bridgeState === 'error'
        ? 'Retry live position'
        : 'Connect live position'

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="brand">
          <div className="brand-mark">EA</div>
          <div><h1>Exiles Atlas</h1><p>Second-screen companion</p></div>
        </header>

        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search locations or notes" />
        </label>

        <div className="filters" aria-label="POI categories">
          {(['All', ...categoryNames] as const).map((category) => (
            <button key={category} className={activeCategory === category ? 'filter active' : 'filter'} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>

        <div className="data-pack-tools">
          <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importDataPack(event.target.files?.[0])} />
          <button className="tool-button" onClick={() => importRef.current?.click()}>Import JSON data pack</button>
          <p>Imports add or update map data while keeping your notes and progress.</p>
          {dataPackMessage && <p className="tool-message" role="status">{dataPackMessage}</p>}
        </div>

        <div className="location-list">
          <div className="list-heading"><span>Locations</span><b>{filtered.length}</b></div>
          {filtered.map((poi) => (
            <button key={poi.id} className={selected?.id === poi.id ? 'location selected' : 'location'} onClick={() => setSelected(poi)}>
              <span className={`status-dot ${poi.status}`} />
              <span><strong>{poi.name}</strong><small>{poi.category}</small></span>
              <em>{poi.status}</em>
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><span className="eyebrow">Exiled Lands</span><h2>Region Map</h2></div>
          <button className={isLive ? 'live enabled' : 'live'} onClick={toggleLive}><span /> {buttonLabel}</button>
        </header>

        <div className="map-area">
          <div className="map-grid" role="img" aria-label="Stylized Exiled Lands map">
            <div className="terrain terrain-one" /><div className="terrain terrain-two" /><div className="terrain terrain-three" />
            {filtered.map((poi) => (
              <button key={poi.id} title={poi.name} className={`poi-marker ${poi.category.toLowerCase()} ${selected?.id === poi.id ? 'selected' : ''}`} style={{ left: `${poi.x}%`, top: `${poi.y}%` }} onClick={() => setSelected(poi)}>
                <span>{poi.category === 'Boss' ? '†' : poi.category === 'Chest' ? '◆' : '●'}</span>
              </button>
            ))}
            {position && marker && <div className={isLive ? 'player-marker' : 'player-marker stale'} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}><span /></div>}
            <form className="calibration" onSubmit={applyCalibration} aria-label="Map coordinate calibration">
              <strong>Map calibration</strong>
              <small>Enter the world-coordinate bounds for this map.</small>
              <div className="calibration-fields">
                {(['minX', 'maxX', 'minY', 'maxY'] as const).map((key) => (
                  <label key={key}>{key}<input type="number" step="any" value={calibrationDraft[key]} onChange={(event) => setCalibrationDraft((draft) => ({ ...draft, [key]: Number(event.target.value) }))} /></label>
                ))}
              </div>
              <button type="submit" className="tool-button">Save calibration</button>
            </form>
            <div className="coordinates">
              {position ? `X ${position.x.toFixed(1)} · Y ${position.y.toFixed(1)} · Z ${position.z.toFixed(1)}${isLive ? '' : ' · stale'}` : bridgeState === 'connecting' ? 'Connecting to local bridge…' : 'No live position'}
              {position && !marker && ' · calibration unavailable'}
            </div>
          </div>
        </div>

        {selected && (
          <aside className="details">
            <button className="close" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <span className="detail-category">{selected.category}</span><h3>{selected.name}</h3>
            {selected.source && <p className="detail-source">Source: {selected.source}</p>}
            <p className="detail-status"><span className={`status-dot ${selected.status}`} /> {selected.status}</p>
            <label>Personal notes<textarea value={selected.note} onChange={(event) => updatePoi(selected.id, { note: event.target.value })} placeholder="Add a route, item, or reminder…" /></label>
            <div className="status-actions"><button onClick={() => markStatus('new')}>New</button><button onClick={() => markStatus('seen')}>Seen</button><button onClick={() => markStatus('collected')}>Collected</button></div>
          </aside>
        )}
      </section>
    </main>
  )
}

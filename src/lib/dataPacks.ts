import type { Category, Poi } from '../types'

export interface DataPackPoi {
  id: string
  name: string
  category: Category
  x: number
  y: number
  source?: string
}

export interface PoiDataPack {
  version: 1
  title: string
  attribution: string
  license: string
  pois: DataPackPoi[]
}

const categories: Category[] = ['Gatherable', 'Treasure', 'Chest', 'Weapon', 'Relic', 'Boss', 'Recipe', 'Event']
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

export function parseDataPack(json: string): PoiDataPack {
  let input: unknown
  try {
    input = JSON.parse(json)
  } catch {
    throw new Error('Data pack is not valid JSON.')
  }
  if (!input || typeof input !== 'object') throw new Error('Data pack must be a JSON object.')

  const raw = input as Record<string, unknown>
  if (raw.version !== 1) throw new Error('Unsupported data pack version; expected version 1.')
  if (!text(raw.title) || !text(raw.attribution) || !text(raw.license)) {
    throw new Error('Data pack must include a title, attribution, and license.')
  }
  if (!Array.isArray(raw.pois) || raw.pois.length === 0) throw new Error('Data pack must contain at least one POI.')

  const ids = new Set<string>()
  const pois = raw.pois.map((item, index): DataPackPoi => {
    if (!item || typeof item !== 'object') throw new Error(`POI ${index + 1} must be an object.`)
    const poi = item as Record<string, unknown>
    if (!text(poi.id) || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(poi.id)) throw new Error(`POI ${index + 1} has an invalid id.`)
    if (ids.has(poi.id)) throw new Error(`Duplicate POI id: ${poi.id}.`)
    ids.add(poi.id)
    if (!text(poi.name)) throw new Error(`POI ${poi.id} needs a name.`)
    if (typeof poi.category !== 'string' || !categories.includes(poi.category as Category)) throw new Error(`POI ${poi.id} has an unsupported category.`)
    if (typeof poi.x !== 'number' || !Number.isFinite(poi.x) || poi.x < 0 || poi.x > 100 || typeof poi.y !== 'number' || !Number.isFinite(poi.y) || poi.y < 0 || poi.y > 100) {
      throw new Error(`POI ${poi.id} coordinates must be finite percentages from 0 to 100.`)
    }
    if (poi.source !== undefined && !text(poi.source)) throw new Error(`POI ${poi.id} source must be a non-empty string when provided.`)
    return { id: poi.id, name: poi.name.trim(), category: poi.category as Category, x: poi.x, y: poi.y, ...(typeof poi.source === 'string' ? { source: poi.source.trim() } : {}) }
  })

  return { version: 1, title: raw.title.trim(), attribution: raw.attribution.trim(), license: raw.license.trim(), pois }
}

export function mergeDataPack(current: Poi[], pack: PoiDataPack): Poi[] {
  const byId = new Map(current.map((poi) => [poi.id, poi]))
  for (const imported of pack.pois) {
    const existing = byId.get(imported.id)
    byId.set(imported.id, {
      ...imported,
      source: imported.source ?? `${pack.attribution} (${pack.license})`,
      status: existing?.status ?? 'new',
      note: existing?.note ?? '',
    })
  }
  return [...byId.values()]
}

import type { Poi } from '../types'

const STORAGE_KEY = 'exiles-atlas:persistence:v1'

export function loadPois(fallback: Poi[]): Poi[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const saved = JSON.parse(raw) as Poi[]
    if (!Array.isArray(saved)) return fallback

    const savedById = new Map(saved.map((poi) => [poi.id, poi]))
    return fallback.map((poi) => savedById.get(poi.id) ?? poi)
  } catch {
    return fallback
  }
}

export function savePois(pois: Poi[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pois))
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
}

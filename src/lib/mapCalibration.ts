export interface MapCalibration {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface MapPoint {
  x: number
  y: number
}

export const DEFAULT_CALIBRATION: MapCalibration = { minX: 0, maxX: 100, minY: 0, maxY: 100 }
const STORAGE_KEY = 'exiles-atlas:map-calibration:v1'

export function mapWorldPosition(position: { x: number; y: number }, calibration: MapCalibration): MapPoint | null {
  const { minX, maxX, minY, maxY } = calibration
  if (![position.x, position.y, minX, maxX, minY, maxY].every(Number.isFinite) || maxX <= minX || maxY <= minY) return null
  const clamp = (value: number) => Math.min(100, Math.max(0, value))
  return {
    x: clamp(((position.x - minX) / (maxX - minX)) * 100),
    y: clamp(((position.y - minY) / (maxY - minY)) * 100),
  }
}

export function loadCalibration(): MapCalibration {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved || typeof saved !== 'object') return DEFAULT_CALIBRATION
    const value = saved as Partial<MapCalibration>
    if (![value.minX, value.maxX, value.minY, value.maxY].every((item) => typeof item === 'number' && Number.isFinite(item)) || value.maxX! <= value.minX! || value.maxY! <= value.minY!) return DEFAULT_CALIBRATION
    return { minX: value.minX!, maxX: value.maxX!, minY: value.minY!, maxY: value.maxY! }
  } catch {
    return DEFAULT_CALIBRATION
  }
}

export function saveCalibration(calibration: MapCalibration): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration)) } catch { /* Calibration is optional if storage is unavailable. */ }
}

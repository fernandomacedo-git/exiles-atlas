import { describe, expect, it } from 'vitest'
import { mapWorldPosition } from '../src/lib/mapCalibration'

describe('map coordinate calibration', () => {
  it('maps configured world bounds to map percentages', () => {
    expect(mapWorldPosition({ x: 50, y: 25 }, { minX: 0, maxX: 100, minY: 0, maxY: 100 })).toEqual({ x: 50, y: 25 })
  })

  it('clamps coordinates outside the configured bounds', () => {
    expect(mapWorldPosition({ x: 150, y: -20 }, { minX: 0, maxX: 100, minY: 0, maxY: 100 })).toEqual({ x: 100, y: 0 })
  })

  it('rejects invalid bounds', () => {
    expect(mapWorldPosition({ x: 1, y: 2 }, { minX: 5, maxX: 5, minY: 0, maxY: 10 })).toBeNull()
  })
})

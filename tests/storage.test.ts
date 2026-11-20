import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadPois, savePois } from '../src/lib/storage'
import type { Poi } from '../src/types'

const fallback: Poi[] = [{ id: 'test', name: 'Test', category: 'Chest', x: 10, y: 20, status: 'new', note: '' }]

describe('local POI storage', () => {
  afterEach(() => localStorage.clear())

  it('returns fallback data when storage is empty', () => {
    expect(loadPois(fallback)).toEqual(fallback)
  })

  it('returns fallback data for malformed storage', () => {
    localStorage.setItem('exiles-atlas:persistence:v1', '{bad')
    expect(loadPois(fallback)).toEqual(fallback)
  })

  it('persists and reloads POI state', () => {
    savePois([{ ...fallback[0], status: 'collected', note: 'Saved route' }])
    expect(loadPois(fallback)[0]).toMatchObject({ status: 'collected', note: 'Saved route' })
  })
})

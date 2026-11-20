import { describe, expect, it } from 'vitest'
import { mergeDataPack, parseDataPack } from '../src/lib/dataPacks'

const validPack = {
  version: 1,
  title: 'Community map',
  attribution: 'Atlas contributors',
  license: 'CC BY 4.0',
  pois: [{ id: 'iron-deposit', name: 'Iron Deposit Updated', category: 'Gatherable', x: 10, y: 25 }],
}

describe('POI data packs', () => {
  it('validates and parses a licensed data pack', () => {
    expect(parseDataPack(JSON.stringify(validPack))).toMatchObject({ title: 'Community map', attribution: 'Atlas contributors', license: 'CC BY 4.0' })
  })

  it('rejects invalid coordinates and duplicate ids', () => {
    expect(() => parseDataPack(JSON.stringify({ ...validPack, pois: [{ ...validPack.pois[0], x: 101 }] }))).toThrow('coordinates')
    expect(() => parseDataPack(JSON.stringify({ ...validPack, pois: [validPack.pois[0], validPack.pois[0]] }))).toThrow('Duplicate')
  })

  it('preserves personal progress when updating an existing POI', () => {
    const pack = parseDataPack(JSON.stringify(validPack))
    const merged = mergeDataPack([{ ...validPack.pois[0], status: 'collected', note: 'My route', source: 'old' }], pack)
    expect(merged[0]).toMatchObject({ name: 'Iron Deposit Updated', status: 'collected', note: 'My route', source: 'Atlas contributors (CC BY 4.0)' })
  })
})

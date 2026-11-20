export type Category =
  | 'Gatherable'
  | 'Treasure'
  | 'Chest'
  | 'Weapon'
  | 'Relic'
  | 'Boss'
  | 'Recipe'
  | 'Event'

export type PoiStatus = 'new' | 'seen' | 'collected'

export interface Poi {
  id: string
  name: string
  category: Category
  x: number
  y: number
  status: PoiStatus
  note: string
  source?: string
}

export interface LivePosition {
  x: number
  y: number
  z: number
  updatedAt: number
}

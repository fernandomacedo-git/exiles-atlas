import type { Category, Poi } from '../types'

export const categoryNames: Category[] = [
  'Gatherable',
  'Treasure',
  'Chest',
  'Weapon',
  'Relic',
  'Boss',
  'Recipe',
  'Event',
]

export const initialPois: Poi[] = [
  { id: 'dregs', name: 'The Dregs', category: 'Relic', x: 43, y: 72, status: 'seen', note: 'Dungeon entrance; check for learned recipes.', source: 'User seed' },
  { id: 'leviathan', name: 'Bright Leviathan', category: 'Chest', x: 27, y: 38, status: 'new', note: '', source: 'User seed' },
  { id: 'new-asagarth', name: 'New Asagarth', category: 'Boss', x: 68, y: 31, status: 'seen', note: 'Heavy clan presence.', source: 'User seed' },
  { id: 'khari-treasure', name: 'Khari Treasure', category: 'Treasure', x: 58, y: 57, status: 'collected', note: 'Mountain route is safest.', source: 'User seed' },
  { id: 'iron-deposit', name: 'Iron Deposit', category: 'Gatherable', x: 36, y: 48, status: 'new', note: '', source: 'User seed' },
  { id: 'mounds', name: 'Mounds of the Dead', category: 'Event', x: 49, y: 20, status: 'new', note: '', source: 'User seed' },
  { id: 'eyelet-recipes', name: 'Eyelet Cape Recipes', category: 'Recipe', x: 76, y: 68, status: 'new', note: '', source: 'User seed' },
]

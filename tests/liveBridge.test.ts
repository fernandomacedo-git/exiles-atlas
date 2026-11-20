import { describe, expect, it, vi } from 'vitest'
import { LivePositionBridge } from '../src/lib/liveBridge'
import type { LivePosition } from '../src/types'

class MockWebSocket {
  static instance: MockWebSocket
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(public url: string) {
    MockWebSocket.instance = this
  }

  close() {
    this.onclose?.()
  }
}

describe('LivePositionBridge', () => {
  it('accepts a finite position frame', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)
    const positions: LivePosition[] = []
    const bridge = new LivePositionBridge('ws://127.0.0.1/test', (position) => positions.push(position), vi.fn())

    bridge.connect()
    MockWebSocket.instance.onmessage?.({ data: JSON.stringify({ type: 'position', x: 12.5, y: 44.2, z: 8 }) })

    expect(positions).toHaveLength(1)
    expect(positions[0]).toMatchObject({ x: 12.5, y: 44.2, z: 8 })
  })

  it('rejects a position frame with non-finite values', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)
    const listener = vi.fn()
    const bridge = new LivePositionBridge('ws://127.0.0.1/test', listener, vi.fn())

    bridge.connect()
    MockWebSocket.instance.onmessage?.({ data: JSON.stringify({ type: 'position', x: null, y: 2, z: 3 }) })

    expect(listener).not.toHaveBeenCalled()
  })
})

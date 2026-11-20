import { afterEach, describe, expect, it, vi } from 'vitest'
import { LivePositionBridge } from '../src/lib/liveBridge'
import type { LivePosition } from '../src/types'

class MockWebSocket {
  static instance: MockWebSocket
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(public url: string) {
    MockWebSocket.instance = this
  }

  close() {
    this.onclose?.()
  }

  emitClose() {
    this.onclose?.()
  }
}

describe('LivePositionBridge lifecycle', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('moves through connecting and connected for valid position messages', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)
    const positions: LivePosition[] = []
    const states: string[] = []
    const bridge = new LivePositionBridge('ws://127.0.0.1/test', (value) => positions.push(value), (state) => states.push(state))

    bridge.connect()
    MockWebSocket.instance.onopen?.()
    MockWebSocket.instance.onmessage?.({ data: JSON.stringify({ type: 'position', x: 12.5, y: 44.2, z: 8 }) })

    expect(states).toEqual(['connecting', 'connected'])
    expect(positions[0]).toMatchObject({ x: 12.5, y: 44.2, z: 8 })
  })

  it('clears a failed connection and can be retried', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)
    const states: string[] = []
    const bridge = new LivePositionBridge('ws://127.0.0.1/test', vi.fn(), (state) => states.push(state))

    bridge.connect()
    const failedSocket = MockWebSocket.instance
    failedSocket.onerror?.()
    failedSocket.emitClose()
    bridge.connect()

    expect(states).toEqual(['connecting', 'error', 'connecting'])
  })

  it('disconnects without treating intentional close as an error', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)
    const states: string[] = []
    const bridge = new LivePositionBridge('ws://127.0.0.1/test', vi.fn(), (state) => states.push(state))

    bridge.connect()
    bridge.disconnect()
    MockWebSocket.instance.emitClose()

    expect(states).toEqual(['connecting', 'disconnected'])
  })

  it('forwards valid discovery messages and ignores malformed frames', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)
    const discovered = vi.fn()
    const bridge = new LivePositionBridge('ws://127.0.0.1/test', vi.fn(), vi.fn(), discovered)

    bridge.connect()
    MockWebSocket.instance.onmessage?.({ data: JSON.stringify({ type: 'discovery', poiId: 'iron-deposit' }) })
    MockWebSocket.instance.onmessage?.({ data: '{' })

    expect(discovered).toHaveBeenCalledOnce()
    expect(discovered).toHaveBeenCalledWith('iron-deposit')
  })
})

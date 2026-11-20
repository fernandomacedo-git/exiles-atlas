import type { LivePosition } from '../types'

export type LiveBridgeMessage =
  | { type: 'position'; x: number; y: number; z: number }
  | { type: 'discovery'; poiId: string }

export type BridgeState = 'disconnected' | 'connecting' | 'connected' | 'error'
export type PositionListener = (position: LivePosition) => void
export type DiscoveryListener = (poiId: string) => void
export type StateListener = (state: BridgeState) => void

function parseMessage(data: unknown): LiveBridgeMessage | null {
  if (typeof data !== 'string') return null

  try {
    const value: unknown = JSON.parse(data)
    if (!value || typeof value !== 'object') return null
    const message = value as Record<string, unknown>

    if (
      message.type === 'position' &&
      typeof message.x === 'number' && Number.isFinite(message.x) &&
      typeof message.y === 'number' && Number.isFinite(message.y) &&
      typeof message.z === 'number' && Number.isFinite(message.z)
    ) {
      return { type: 'position', x: message.x, y: message.y, z: message.z }
    }

    if (message.type === 'discovery' && typeof message.poiId === 'string' && message.poiId.length > 0) {
      return { type: 'discovery', poiId: message.poiId }
    }
  } catch {
    // Ignore invalid JSON frames.
  }

  return null
}

export class LivePositionBridge {
  private socket: WebSocket | null = null
  private state: BridgeState = 'disconnected'

  constructor(
    private readonly url: string,
    private readonly onPosition: PositionListener,
    private readonly onState: StateListener,
    private readonly onDiscovery: DiscoveryListener = () => undefined,
  ) {}

  connect(): void {
    if (this.socket) return

    this.setState('connecting')
    let socket: WebSocket
    try {
      socket = new WebSocket(this.url)
    } catch {
      this.setState('error')
      return
    }

    this.socket = socket
    socket.onopen = () => {
      if (this.socket === socket) this.setState('connected')
    }
    socket.onmessage = (event: MessageEvent) => {
      if (this.socket !== socket) return
      const message = parseMessage(event.data)
      if (!message) return

      if (message.type === 'position') {
        this.onPosition({ ...message, updatedAt: Date.now() })
      } else {
        this.onDiscovery(message.poiId)
      }
    }
    socket.onerror = () => {
      if (this.socket === socket) this.setState('error')
    }
    socket.onclose = () => {
      if (this.socket !== socket) return
      this.socket = null
      if (this.state !== 'error') this.setState('disconnected')
    }
  }

  disconnect(): void {
    const socket = this.socket
    this.socket = null
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onerror = null
      socket.onclose = null
      socket.close()
    }
    this.setState('disconnected')
  }

  private setState(state: BridgeState): void {
    if (this.state === state) return
    this.state = state
    this.onState(state)
  }
}

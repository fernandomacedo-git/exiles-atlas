import type { LivePosition, Poi } from '../types'

export type LiveBridgeMessage =
  | { type: 'position'; x: number; y: number; z: number }
  | { type: 'discovery'; poiId: string }

export type PositionListener = (position: LivePosition) => void

export class LivePositionBridge {
  private socket: WebSocket | null = null

  constructor(
    private readonly url: string,
    private readonly onPosition: PositionListener,
    private readonly onDisconnect: () => void,
  ) {}

  connect(): void {
    this.disconnect()

    this.socket = new WebSocket(this.url)
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as LiveBridgeMessage
        if (message.type === 'position') {
          if (![message.x, message.y, message.z].every(Number.isFinite)) return
          this.onPosition({ x: message.x, y: message.y, z: message.z, updatedAt: Date.now() })
        }
      } catch {
        // Ignore malformed bridge frames; the live status remains stale if updates stop.
      }
    }
    this.socket.onclose = () => {
      this.socket = null
      this.onDisconnect()
    }
    this.socket.onerror = () => this.onDisconnect()
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.onclose = null
      this.socket.close()
      this.socket = null
    }
    this.onDisconnect()
  }
}

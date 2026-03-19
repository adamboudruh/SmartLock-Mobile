import { DeviceState } from './devices';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://10.0.0.49:3000/mobile';

type StateUpdateCallback = (state: DeviceState) => void;
type ConnectionCallback = (connected: boolean) => void;

class WsService {
  private ws: WebSocket | null = null;  // ws connection instance
  private onStateUpdate: StateUpdateCallback | null = null; // callback to notify UI of state updates
  private onConnectionChange: ConnectionCallback | null = null;
  private _connected = false;

  // this is the standard pattern for webSocket in react native
  // create a service singletan to manage the connection and export a hook to subscribe to state updates
  onUpdate(callback: StateUpdateCallback) {
    this.onStateUpdate = callback;
  }

  onConnection(callback: ConnectionCallback) {
    this.onConnectionChange = callback;
  }

  get connected() {
    return this._connected;
  }

  private setConnected(val: boolean) {
    if (this._connected !== val) {
      this._connected = val;
      this.onConnectionChange?.(val);
    }
  }

  connect() {
    if (this.ws) return; // already connected

    console.log('[WS] Connecting...');
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.setConnected(true);
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.action === 'STATE_UPDATE' && this.onStateUpdate) {
          this.onStateUpdate({
            isLocked: msg.isLocked,
            isAjar:   msg.isAjar,
            online:   msg.online,
          });
        }
      } catch {
        console.warn('[WS] Failed to parse message:', e.data);
      }
    };

    this.ws.onerror = (e) => {
      console.warn('Error:', e);
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected, retrying in 3s...');
      this.ws = null;
      setTimeout(() => this.connect(), 3000); // auto reconnect
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.setConnected(false);
  }
}

// Export a single shared instance — same pattern as wsManager on the backend
export const wsService = new WsService();
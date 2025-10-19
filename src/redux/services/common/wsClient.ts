// src/redux/services/common/wsClient.ts
class WebSocketClient {
  private socket: WebSocket | null = null;
  private messageQueue: any[] = [];
  private listeners: ((data: any) => void)[] = [];

  connect(url: string) {
    if (this.socket) return;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");

      // flush queued messages
      this.messageQueue.forEach((msg) =>
        this.socket?.send(JSON.stringify(msg))
      );
      this.messageQueue = [];
    };

    this.socket.onclose = () => {
      console.log("❌ WebSocket closed");
      this.socket = null;
    };

    this.socket.onerror = (err) => {
      console.error("⚠️ WebSocket error", err);
    };

    this.socket.onmessage = (event) => {
      let parsed;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        parsed = event.data;
      }
      this.listeners.forEach((cb) => cb(parsed));
    };
  }

  send(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ WebSocket not open, queuing message");
      this.messageQueue.push(message);
    }
  }

  onMessage(callback: (data: any) => void) {
    this.listeners.push(callback);
  }
}

export const wsClient = new WebSocketClient();
// // src/redux/services/common/wsClient.ts
// class WebSocketClient {
//   private socket: WebSocket | null = null;
//   private messageQueue: any[] = [];
//   private listeners: ((data: any) => void)[] = [];

//   connect(url: string) {
//     if (this.socket) return;

//     this.socket = new WebSocket(url);

//     this.socket.onopen = () => {
//       console.log("✅ WebSocket connected");

//       // flush queued messages
//       this.messageQueue.forEach((msg) =>
//         this.socket?.send(JSON.stringify(msg))
//       );
//       this.messageQueue = [];
//     };

//     this.socket.onclose = () => {
//       console.log("❌ WebSocket closed");
//       this.socket = null;
//     };

//     this.socket.onerror = (err) => {
//       console.error("⚠️ WebSocket error", err);
//     };

//     this.socket.onmessage = (event) => {
//       let parsed;
//       try {
//         parsed = JSON.parse(event.data);
//       } catch {
//         parsed = event.data;
//       }
//       this.listeners.forEach((cb) => cb(parsed));
//     };
//   }

//   send(message: any) {
//     if (this.socket?.readyState === WebSocket.OPEN) {
//       this.socket.send(JSON.stringify(message));
//     } else {
//       console.warn("⚠️ WebSocket not open, queuing message");
//       this.messageQueue.push(message);
//     }
//   }

//   onMessage(callback: (data: any) => void) {
//     this.listeners.push(callback);
//   }
// }

// export const wsClient = new WebSocketClient();

// src/redux/services/common/wsClient.ts
class WebSocketClient {
  private socket: WebSocket | null = null;
  private messageQueue: any[] = [];
  private listeners: Set<(data: any) => void> = new Set(); // 🔥 Use Set for easy cleanup
  private currentUrl: string | null = null; // 🔥 Track current URL

  connect(url: string) {
    // 🔥 If already connected to this URL, don't reconnect
    if (this.socket && this.currentUrl === url && this.socket.readyState === WebSocket.OPEN) {
      console.log("✅ [wsClient] Already connected to", url);
      return;
    }

    // 🔥 Disconnect existing connection if URL is different
    if (this.socket && this.currentUrl !== url) {
      console.log("🔄 [wsClient] URL changed, disconnecting old connection");
      this.disconnect();
    }

    console.log("🔌 [wsClient] Connecting to", url);
    this.currentUrl = url;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("✅ [wsClient] WebSocket connected");

      // Flush queued messages
      this.messageQueue.forEach((msg) =>
        this.socket?.send(JSON.stringify(msg))
      );
      this.messageQueue = [];
    };

    this.socket.onclose = () => {
      console.log("❌ [wsClient] WebSocket closed");
      this.socket = null;
      this.currentUrl = null;
    };

    this.socket.onerror = (err) => {
      console.error("⚠️ [wsClient] WebSocket error", err);
    };

    this.socket.onmessage = (event) => {
      let parsed;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        parsed = event.data;
      }
      
      // 🔥 Notify all listeners
      this.listeners.forEach((callback) => {
        try {
          callback(parsed);
        } catch (err) {
          console.error("❌ [wsClient] Error in message handler:", err);
        }
      });
    };
  }

  // 🔥 NEW: Disconnect method
  disconnect() {
    if (this.socket) {
      console.log("🔌 [wsClient] Disconnecting WebSocket");
      this.socket.close();
      this.socket = null;
      this.currentUrl = null;
    }
    // Don't clear listeners here - let components manage their own
  }

  // 🔥 NEW: Check if connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  send(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ [wsClient] WebSocket not open, queuing message");
      this.messageQueue.push(message);
    }
  }

  // 🔥 FIXED: Return cleanup function
  onMessage(callback: (data: any) => void): () => void {
    this.listeners.add(callback);
    
    // Return cleanup function
    return () => {
      this.listeners.delete(callback);
      console.log("🧹 [wsClient] Listener removed. Active listeners:", this.listeners.size);
    };
  }

  // 🔥 NEW: Clear all listeners (useful for debugging)
  clearListeners() {
    this.listeners.clear();
    console.log("🧹 [wsClient] All listeners cleared");
  }
}

export const wsClient = new WebSocketClient();
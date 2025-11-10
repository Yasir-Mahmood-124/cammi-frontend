// services/websocketManager.ts

type MessageHandler = (data: any) => void;
type ErrorHandler = (error: any) => void;
type CloseHandler = (event: CloseEvent) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string = '';
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private closeHandlers: Set<CloseHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  connect(url: string): void {
    // Don't reconnect if already connected to the same URL
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.url === url) {
      console.log('WebSocket already connected');
      return;
    }

    // Close existing connection if URL is different
    if (this.ws && this.url !== url) {
      this.disconnect();
    }

    this.url = url;
    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this._connect();
  }

  private _connect(): void {
    try {
      console.log('🔌 Connecting WebSocket to:', this.url);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.ws.onclose = (event) => {
        console.log('🔗 WebSocket closed:', event.code, event.reason);
        this.closeHandlers.forEach(handler => handler(event));

        // Attempt to reconnect if not intentionally closed
        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          this.reconnectTimeout = setTimeout(() => {
            this._connect();
          }, 2000 * this.reconnectAttempts); // Exponential backoff
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    // Clear all handlers
    this.messageHandlers.clear();
    this.errorHandlers.clear();
    this.closeHandlers.clear();
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  onClose(handler: CloseHandler): () => void {
    this.closeHandlers.add(handler);
    return () => {
      this.closeHandlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws ? this.ws.readyState : null;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();    
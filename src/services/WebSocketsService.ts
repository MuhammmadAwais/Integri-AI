type WebSocketMessage = {
  type: string;
  content?: string;
  token?: string;
  session_id?: string;
  provider?: string;
  model?: string;
};

// 1. Export class for multiple instances (Playground)
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandler: ((data: any) => void) | null = null;
  private readonly socketUrl = import.meta.env.VITE_APP_WEBSOCKET_BASE_URL;
  private messageQueue: WebSocketMessage[] = [];

  // Connect to a specific session
  connect(token: string, sessionId: string) {
    if (this.socket) {
      this.disconnect();
    }

    console.log(`🔌 [WS] Connecting to session: ${sessionId}`);
    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      // Authenticate immediately
      this.send({
        type: "auth",
        token: token,
        session_id: sessionId,
      });
      this.flushQueue();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      } catch (e) {
        console.error("❌ [WS] Parse error:", e);
      }
    };

    this.socket.onerror = (error) => console.error("❌ [WS] Error:", error);

    this.socket.onclose = () => {
      // Optional: Auto-reconnect logic could go here
    };
  }

  // Send message with explicit Provider routing
  sendMessage(content: string, model: string, provider: string) {
    const message: WebSocketMessage = {
      type: "message",
      content: content,
      provider: provider, // Critical for routing to Claude/Gemini
      model: model,
    };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  onMessage(callback: (data: any) => void) {
    this.messageHandler = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private send(data: WebSocketMessage) {
    this.socket?.send(JSON.stringify(data));
  }

  private flushQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) this.send(msg);
    }
  }
}

// 2. Default Singleton for Main Chat (preserves existing app functionality)
export const socketService = new WebSocketService();

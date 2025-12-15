type WebSocketMessage = {
  type: string;
  content?: string;
  token?: string;
  session_id?: string;
  provider?: string;
  model?: string;
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandler: ((data: any) => void) | null = null;
  // Use env var or default
  private readonly socketUrl =
    import.meta.env.VITE_APP_WEBSOCKET_BASE_URL;

  // FIX: Queue for messages sent before connection is ready
  private messageQueue: WebSocketMessage[] = [];

  connect(token: string, sessionId: string) {
    // 1. Log connection attempt
    console.log(`🔌 [WS] Attempting to connect to: ${this.socketUrl}`);
    console.log(`🔌 [WS] Session ID: ${sessionId}`);

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("🔌 [WS] Already connected, skipping...");
      return;
    }

    if (this.socket) {
      console.log("🔌 [WS] Closing existing socket before new connection...");
      this.disconnect();
    }

    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      console.log("✅ [WS] Connection OPENED!");

      // 2. Authenticate immediately
      console.log("🔌 [WS] Sending Auth Packet...");
      this.send({
        type: "auth",
        token: token,
        session_id: sessionId,
      });

      // 3. Send any queued messages
      this.flushQueue();
    };

    this.socket.onmessage = (event) => {
      try {
        console.log("📩 [WS] Raw Message Received:", event.data); // DEBUG LOG
        const data = JSON.parse(event.data);
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      } catch (e) {
        console.error("❌ [WS] Failed to parse message:", e);
      }
    };

    this.socket.onerror = (error) => {
      console.error("❌ [WS] Socket Error:", error);
    };

    this.socket.onclose = (event) => {
      console.log(`⚠️ [WS] Connection Closed (Code: ${event.code})`);
    };
  }

  sendMessage(content: string, model: string = "gpt-4o") {
    const message: WebSocketMessage = {
      type: "message",
      content: content,
      provider: "openai",
      model: model,
    };

    // FIX: Check if ready. If not, queue it.
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("📤 [WS] Sending message immediately:", content);
      this.send(message);
    } else {
      console.warn("⏳ [WS] Socket not ready. Queueing message:", content);
      this.messageQueue.push(message);
    }
  }

  onMessage(callback: (data: any) => void) {
    this.messageHandler = callback;
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 [WS] Disconnecting...");
      this.socket.close();
      this.socket = null;
    }
  }

  private send(data: WebSocketMessage) {
    this.socket?.send(JSON.stringify(data));
  }

  private flushQueue() {
    if (this.messageQueue.length > 0) {
      console.log(
        `🚀 [WS] Flushing ${this.messageQueue.length} queued messages...`
      );
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        if (msg) {
          console.log("📤 [WS] Sending queued message:", msg.content);
          this.send(msg);
        }
      }
    }
  }
}

export const socketService = new WebSocketService();

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
  // Use your production URL or localhost based on environment
  private readonly socketUrl = "wss://integri.cloud/api/v1/";

  connect(token: string, sessionId: string) {
    // If already connected to this specific session, do nothing
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // Close existing connection if any
    this.disconnect();

    console.log("🔌 Connecting to WebSocket...");
    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      console.log("✅ WebSocket Connected");
      // Authenticate immediately
      this.send({
        type: "auth",
        token: token,
        session_id: sessionId,
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    this.socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    this.socket.onclose = () => {
      console.log("⚠️ WebSocket Disconnected");
    };
  }

  sendMessage(content: string, model: string = "gpt-4o") {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({
        type: "message",
        content: content,
        provider: "openai",
        model: model,
      });
    } else {
      console.error("Cannot send message: Socket is not open");
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
}

export const socketService = new WebSocketService();

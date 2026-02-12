type WebSocketMessage = {
  type: string;
  content?: string;
  token?: string;
  session_id?: string;
  provider?: string;
  model?: string;
  file_ids?: string[]; // Added file_ids support
};

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandler: ((data: any) => void) | null = null;
  private readonly socketUrl = import.meta.env.VITE_APP_WEBSOCKET_BASE_URL;
  private messageQueue: WebSocketMessage[] = [];

  connect(token: string, sessionId: string) {
    if (this.socket) {
      this.disconnect();
    }

    console.log(`🔌 [WS] Connecting to session: ${sessionId}`);
    this.socket = new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      this.send({
        type: "auth",
        token: token,
        session_id: sessionId,
      });
      this.flushQueue();
    };

    this.socket.onmessage = (event) => {
      try {
        // console.log("📩 [WS] Received Message:",event);
        const data = JSON.parse(event.data);
        // console.log("📩 [WS] Received Message:", data);
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

  // Updated signature to accept fileIds and image generation parameters
  sendMessage(
    content: string,
    model: string,
    provider: string,
    fileIds: string[] = [],
    aspectRatio?: string,
    quality?: string,
  ) {
    const message: WebSocketMessage = {
      type: "message",
      content: content,
      provider: provider,
      model: model,
      file_ids: fileIds, // Include file IDs in the payload
      ...(aspectRatio && { aspect_ratio: aspectRatio }), // Include aspect ratio if provided
      ...(quality && { quality: quality }), // Include quality/resolution if provided
    };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("📤 [WS] Sending Message:", message);
      this.send(message);
      console.log("📤 [WS] Sending Message:", message);
    } else {
      console.log("📤 [WS] Sending Message:", message);
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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  private flushQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) this.send(msg);
    }
  }
}

export const socketService = new WebSocketService();

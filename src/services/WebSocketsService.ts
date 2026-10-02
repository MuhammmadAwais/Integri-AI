type WebSocketMessage = {
  type: string;
  content?: string;
  token?: string;
  session_id?: string;
  provider?: string;
  model?: string;
  file_ids?: string[]; // Added file_ids support
  web_search?: boolean; // Web search toggle
};

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandler: ((data: any) => void) | null = null;
  private closeHandler: (() => void) | null = null;
  private lastAuth: { token: string; sessionId: string } | null = null;
  // Dev: same-origin socket through Vite's ws proxy (see backendApi.ts).
  private readonly socketUrl = import.meta.env.DEV
    ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/v1/chat`
    : import.meta.env.VITE_APP_WEBSOCKET_BASE_URL;
  private messageQueue: WebSocketMessage[] = [];

  connect(token: string, sessionId: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.lastAuth = { token, sessionId };
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
        console.log("📩 [WS] Received Message:",event);
        const data = JSON.parse(event.data);
        console.log("📩 [WS] Received Message:", data);
        if (this.messageHandler) {
          this.messageHandler(data);
        }
      } catch (e) {
        console.error("❌ [WS] Parse error:", e);
      }
    };

    this.socket.onerror = (error) => console.error("❌ [WS] Error:", error);

    const socket = this.socket;
    socket.onclose = () => {
      // disconnect() detaches this.socket first, so only unexpected closes
      // (server dropped the connection, network loss) reach the handler.
      if (this.socket === socket) {
        this.socket = null;
        this.closeHandler?.();
      }
    };
  }

  // Updated signature to accept fileIds, image generation parameters, and web search
  sendMessage(
    content: string,
    model: string,
    provider: string,
    fileIds: string[] = [],
    aspectRatio?: string,
    quality?: string,
    webSearch?: boolean,
  ) {
    const message: WebSocketMessage = {
      type: "message",
      content: content,
      provider: provider,
      model: model,
      file_ids: fileIds, // Include file IDs in the payload
      ...(aspectRatio && { aspect_ratio: aspectRatio }), // Include aspect ratio if provided
      ...(quality && { quality: quality }), // Include quality/resolution if provided
      ...(webSearch && { web_search: true }), // Include web_search flag if enabled
    };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("📤 [WS] Sending Message:", message);
      this.send(message);
      console.log("📤 [WS] Sending Message:", message);
    } else {
      console.log("📤 [WS] Sending Message:", message);
      this.messageQueue.push(message);
      // The server dropped the previous connection: reopen the same session;
      // onopen re-authenticates and flushes the queue.
      if (!this.socket && this.lastAuth) {
        this.connect(this.lastAuth.token, this.lastAuth.sessionId);
      }
    }
  }

  onMessage(callback: (data: any) => void) {
    this.messageHandler = callback;
  }

  onClose(callback: () => void) {
    this.closeHandler = callback;
  }

  disconnect() {
    this.lastAuth = null;
    if (!this.socket) return;

    const socket = this.socket;
    this.socket = null; // Detach immediately so no new messages are sent/queued

    if (socket.readyState === WebSocket.OPEN) {
      // Already open — close cleanly
      socket.close();
    } else if (socket.readyState === WebSocket.CONNECTING) {
      // Still connecting (React 18 Strict Mode double-mount scenario).
      // Wait for it to open, then close it immediately.
      console.log("🔌 [WS] Deferred close: socket still CONNECTING");
      socket.onopen = () => socket.close();
    }
    // CLOSING (2) or CLOSED (3) — nothing to do
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

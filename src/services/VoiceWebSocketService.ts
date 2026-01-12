// src/services/VoiceWebSocketService.ts

type VoiceMessage =
  | { type: "auth"; token: string; session_id: string; model?: string }
  | { type: "audio"; data: string }
  | { type: "commit" }
  | { type: "interrupt" }
  | { type: "config"; voice?: string; vad_threshold?: number };

class VoiceWebSocketService extends EventTarget {
  private socket: WebSocket | null = null;
  private url: string = "wss://www.integri.cloud/api/v1/voice";

  public get isReady(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private log(msg: string, data?: any) {
    // Only log essential events to keep console clean for real-time debugging
    const time = new Date().toLocaleTimeString();
    if (data) {
      console.log(
        `%c[VoiceWS ${time}] ${msg}`,
        "color: #adfa1d; font-weight: bold;",
        data
      );
    } else {
      console.log(
        `%c[VoiceWS ${time}] ${msg}`,
        "color: #adfa1d; font-weight: bold;"
      );
    }
  }

  connect(
    token: string,
    sessionId: string,
    model: string = "gpt-realtime-mini"
  ) {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.log(`🔌 Connecting...`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.log("✅ Connected");
      this.dispatchEvent(new Event("open"));
      this.send({ type: "auth", token, session_id: sessionId, model });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.dispatchEvent(new CustomEvent("message", { detail: data }));
      } catch (e) {
        console.error("❌ Failed to parse incoming message", e);
      }
    };

    this.socket.onclose = (event) => {
      this.log(`❌ Closed (Code: ${event.code})`);
      this.socket = null;
      this.dispatchEvent(new Event("close"));
    };

    this.socket.onerror = (error) => {
      console.error("❌ Error:", error);
      this.dispatchEvent(new Event("error"));
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(payload: VoiceMessage) {
    if (this.isReady && this.socket) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  sendAudioChunk(base64Audio: string) {
    if (!this.isReady) return;
    // Don't log audio chunks, just send fire-and-forget
    this.socket?.send(JSON.stringify({ type: "audio", data: base64Audio }));
  }

  sendCommit() {
    this.log("📝 Sending COMMIT");
    this.send({ type: "commit" });
  }

  sendInterrupt() {
    this.log("✋ Sending INTERRUPT");
    this.send({ type: "interrupt" });
  }
}

export const voiceSocketService = new VoiceWebSocketService();

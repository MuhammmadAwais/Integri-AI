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
      this.log("⚠️ Socket already connected or connecting.");
      return;
    }

    this.log(`🔌 Connecting to ${this.url}...`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.log("✅ WebSocket Open");
      this.dispatchEvent(new Event("open"));
      this.send({ type: "auth", token, session_id: sessionId, model });
    };

    // --- YOUR CUSTOM SNIPPET HERE ---
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Don't log every single audio chunk (too spammy), log other events
        if (data.type !== "audio") {
          this.log(`📩 Received Message: ${data.type}`, data);
        }
        this.dispatchEvent(new CustomEvent("message", { detail: data }));
      } catch (e) {
        console.error("❌ Failed to parse incoming message", e);
      }
    };
    // -------------------------------

    this.socket.onclose = (event) => {
      this.log(`❌ WebSocket Closed (Code: ${event.code})`);
      this.socket = null;
      this.dispatchEvent(new Event("close"));
    };

    this.socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
      this.dispatchEvent(new Event("error"));
    };
  }

  disconnect() {
    if (this.socket) {
      this.log("🔌 Disconnecting...");
      this.socket.close();
      this.socket = null;
    }
  }

  send(payload: VoiceMessage) {
    if (this.isReady && this.socket) {
      if (payload.type !== "audio") {
        this.log(`📤 Sending: ${payload.type}`);
      }
      this.socket.send(JSON.stringify(payload));
    } else {
      this.log(`⚠️ Cannot send '${payload.type}': Socket not ready`);
    }
  }

  sendAudioChunk(base64Audio: string) {
    if (!this.isReady) return;
    this.send({ type: "audio", data: base64Audio });
  }

  sendCommit() {
    this.log("📝 Sending COMMIT (Silence detected)");
    this.send({ type: "commit" });
  }

  sendInterrupt() {
    this.log("✋ Sending INTERRUPT");
    this.send({ type: "interrupt" });
  }
}

export const voiceSocketService = new VoiceWebSocketService();

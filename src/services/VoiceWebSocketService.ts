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
    // 1. Prevent redundant connections if already open/connecting
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.log("⚠️ connect() called but socket is ALREADY OPEN. Ignoring.");
        return;
      }
      if (this.socket.readyState === WebSocket.CONNECTING) {
        this.log("⚠️ connect() called but socket is CONNECTING. Ignoring.");
        return;
      }
    }

    this.log(`🔌 Attempting connection...`, { sessionId, model });

    try {
      const wsUrl = new URL(this.url);
      wsUrl.searchParams.append("token", token);
      wsUrl.searchParams.append("session_id", sessionId);

      this.socket = new WebSocket(wsUrl.toString());
      this.socket.binaryType = "arraybuffer";

      // --- Event Handlers ---

      this.socket.onopen = () => {
        this.log("✅ Socket Connection ESTABLISHED (onopen)");
        this.dispatchEvent(new Event("open"));

        // Send Auth immediately as per protocol
        this.send({
          type: "auth",
          token: token,
          session_id: sessionId,
          model: model,
        });
      };

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

      this.socket.onerror = (event) => {
        console.error("❌ Socket Error Event:", event);
        this.dispatchEvent(new Event("error"));
      };

      this.socket.onclose = (event) => {
        this.log(
          `💀 Socket CLOSED. Code: ${event.code}, Reason: "${event.reason}", Clean: ${event.wasClean}`
        );

        // ANALYZE THE CODE HERE:
        if (event.code === 1006)
          console.error(
            "👉 Code 1006: Abnormal Closure. Usually means the server dropped the connection (Auth failed?) or the network died."
          );
        if (event.code >= 4000)
          console.error(
            `👉 Code ${event.code}: App-specific error from backend.`
          );

        this.socket = null;
        this.dispatchEvent(new Event("close"));
      };
    } catch (e) {
      console.error("❌ Exception during connect:", e);
      this.dispatchEvent(new Event("error"));
    }
  }

  send(payload: VoiceMessage) {
    if (this.isReady && this.socket) {
      if (payload.type !== "audio") {
        this.log(`📤 Sending: ${payload.type}`);
      }
      this.socket.send(JSON.stringify(payload));
    } else {
      this.log(
        `⚠️ Cannot send '${payload.type}': Socket not ready (State: ${this.socket?.readyState})`
      );
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
    this.log("🛑 Sending INTERRUPT");
    this.send({ type: "interrupt" });
  }

  disconnect() {
    if (this.socket) {
      this.log("🔻 disconnect() called manually by Client");
      this.socket.close();
      this.socket = null;
    }
  }
}

export const voiceSocketService = new VoiceWebSocketService();

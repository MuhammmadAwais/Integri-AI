// src/services/VoiceWebSocketService.ts

type VoiceMessage =
  | { type: "auth"; token: string; session_id: string; model?: string }
  | { type: "audio"; data: string } // Base64
  | { type: "commit" }
  | { type: "interrupt" };

class VoiceWebSocketService extends EventTarget {
  private socket: WebSocket | null = null;
  private url: string = "wss://www.integri.cloud/api/v1/voice";
  private isConnected: boolean = false;

  constructor() {
    super();
  }

  // src/services/VoiceWebSocketService.ts

  connect(token: string, sessionId: string, model: string = "gpt-4o-mini-realtime-preview") {
    if (this.socket && this.isConnected) return;

    console.log("🔌 Connecting to Voice Backend...");

    try {
      // 1. Append token to the URL (Browser workaround for missing headers)
      // We also verify if we need to remove 'www' or change the path.
      const wsUrl = new URL(this.url);
      wsUrl.searchParams.append("token", token);
      wsUrl.searchParams.append("session_id", sessionId); // Some backends need this early

      this.socket = new WebSocket(wsUrl.toString());
    } catch (e) {
      console.error("Failed to create WebSocket:", e);
      return;
    }

    this.socket.binaryType = "arraybuffer";

    this.socket.onopen = () => {
      console.log("✅ Voice Socket Open");
      this.isConnected = true;
      this.dispatchEvent(new Event("open"));

      // We still send the auth message just in case the backend supports the "connect-then-auth" flow
      this.send({
        type: "auth",
        token: token,
        session_id: sessionId,
        model: model,
      });
    };

    // ... rest of the file (onmessage, onerror, etc) remains the same

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Dispatch a CustomEvent with the data
        this.dispatchEvent(new CustomEvent("message", { detail: data }));
      } catch (e) {
        console.error("❌ Failed to parse incoming voice message", e);
      }
    };

    this.socket.onerror = (error) => {
      console.error("❌ Voice Socket Error:", error);
      this.dispatchEvent(new Event("error"));
    };

    this.socket.onclose = () => {
      console.log("🔌 Voice Socket Closed");
      this.isConnected = false;
      this.socket = null;
      this.dispatchEvent(new Event("close"));
    };
  }

  send(payload: VoiceMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  sendAudioChunk(base64Audio: string) {
    this.send({ type: "audio", data: base64Audio });
  }

  sendCommit() {
    console.log("📝 Sending Commit (Silence Detected)");
    this.send({ type: "commit" });
  }

  sendInterrupt() {
    console.log("🛑 Sending Interrupt");
    this.send({ type: "interrupt" });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const voiceSocketService = new VoiceWebSocketService();

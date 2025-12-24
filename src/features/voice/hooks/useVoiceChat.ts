// src/features/chat/hooks/useVoiceChat.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { voiceSocketService } from "../../../services/VoiceWebSocketService"; // Check path matches your structure
import { SessionService } from "../../../api/backendApi"; // Import API service

// Configuration
const INPUT_SAMPLE_RATE = 16000;
const SILENCE_THRESHOLD_MS = 3000;
const VAD_THRESHOLD = 0.02;

export const useVoiceChat = (
  token: string | null,
  model: string = "gpt-4o",
  provider: string = "openai" // Added provider
) => {
  // State for session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    | "disconnected"
    | "initializing"
    | "connecting"
    | "connected"
    | "speaking"
    | "listening"
  >("disconnected");

  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isAssistantSpeakingRef = useRef(false);
  const silenceStartRef = useRef<number>(Date.now());
  const isUserSpeakingRef = useRef(false);

  // -- Helper functions (same as before) --
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // -- 1. Lifecycle: Connect Socket when SessionID is created --
  useEffect(() => {
    // Only connect if we have a valid Token AND a real Session ID from API
    if (!token || !sessionId) return;

    const handleMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;

      if (data.type === "audio" && data.data) {
        setStatus("speaking");
        isAssistantSpeakingRef.current = true;
        playAudioChunk(data.data);
      } else if (
        data.type === "speech_ended" ||
        data.type === "response_complete"
      ) {
        isAssistantSpeakingRef.current = false;
        setStatus("connected");
      } else if (data.type === "interrupt") {
        isAssistantSpeakingRef.current = false;
      }
    };

    const handleOpen = () => {
      setStatus("connected");
      // Optional: Send initial config like Dart does
      // voiceSocketService.send({ type: 'config', voice: 'alloy', vad_threshold: 0.6 });
    };

    const handleClose = () => setStatus("disconnected");
    const handleError = () => setError("Socket connection error");

    // Add Listeners
    voiceSocketService.addEventListener("message", handleMessage);
    voiceSocketService.addEventListener("open", handleOpen);
    voiceSocketService.addEventListener("close", handleClose);
    voiceSocketService.addEventListener("error", handleError);

    // Actual Connection
    setStatus("connecting");
    voiceSocketService.connect(token, sessionId, model);

    return () => {
      voiceSocketService.removeEventListener("message", handleMessage);
      voiceSocketService.removeEventListener("open", handleOpen);
      voiceSocketService.removeEventListener("close", handleClose);
      voiceSocketService.removeEventListener("error", handleError);
      voiceSocketService.disconnect();
    };
  }, [token, sessionId, model]); // Runs when sessionId is set

  // -- 2. Audio Playback Logic --
  const playAudioChunk = (base64Data: string) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    const int16Data = new Int16Array(base64ToArrayBuffer(base64Data));
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  // -- 3. Main Action: Start Session --
  const startSession = useCallback(async () => {
    if (!token) {
      setError("Authentication missing");
      return;
    }

    try {
      setError(null);
      setStatus("initializing");

      // A. Create Session via HTTP API (Matches Dart 'setupVoiceWS')
      console.log("⏳ Creating Voice Session...");
      const sessionData = await SessionService.createSession(
        token,
        model,
        provider,
        true // isVoice = true
      );

      const newSessionId = sessionData.id || sessionData.session_id; // Handle API variance
      console.log("✅ Session Created:", newSessionId);

      // B. Initialize Audio (Mic)
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass({ sampleRate: INPUT_SAMPLE_RATE });
      audioContextRef.current = ctx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // VAD / Energy
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setAudioLevel(rms);

        // Interrupt Logic
        if (rms > VAD_THRESHOLD && isAssistantSpeakingRef.current) {
          console.log("🛑 Interrupting...");
          voiceSocketService.sendInterrupt();
          isAssistantSpeakingRef.current = false;
          if (audioContextRef.current) {
            nextStartTimeRef.current = audioContextRef.current.currentTime;
          }
        }

        // Send Audio
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = arrayBufferToBase64(pcm16.buffer);
        voiceSocketService.sendAudioChunk(base64);

        // Commit Logic
        if (rms > VAD_THRESHOLD) {
          silenceStartRef.current = Date.now();
          if (!isUserSpeakingRef.current) {
            isUserSpeakingRef.current = true;
          }
        } else {
          const silenceDuration = Date.now() - silenceStartRef.current;
          if (
            isUserSpeakingRef.current &&
            silenceDuration > SILENCE_THRESHOLD_MS
          ) {
            voiceSocketService.sendCommit();
            isUserSpeakingRef.current = false;
          }
        }
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      // C. Trigger Socket Connection via Effect
      setSessionId(newSessionId);
    } catch (err: any) {
      console.error("Session Start Failed:", err);
      setError(err.message || "Failed to start session");
      setStatus("disconnected");
    }
  }, [token, model, provider]);

  const endSession = useCallback(() => {
    if (processorRef.current) processorRef.current.disconnect();
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();

    voiceSocketService.disconnect();

    setSessionId(null);
    setStatus("disconnected");
  }, []);

  return {
    status,
    audioLevel,
    error,
    startSession,
    endSession,
  };
};

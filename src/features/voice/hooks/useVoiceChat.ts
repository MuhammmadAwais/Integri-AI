// src/features/voice/hooks/useVoiceChat.ts

import { useState, useEffect, useRef, useCallback } from "react";
import { voiceSocketService } from "../../../services/VoiceWebSocketService";
import { SessionService } from "../../../api/backendApi";

const INPUT_SAMPLE_RATE = 16000;
const SILENCE_THRESHOLD_MS = 3000;
const VAD_THRESHOLD = 0.02;

export const useVoiceChat = (
  token: string | null,
  model: string = "gpt-realtime-mini",
  provider: string = "openai"
) => {
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isAssistantSpeakingRef = useRef(false);
  const silenceStartRef = useRef<number>(Date.now());
  const isUserSpeakingRef = useRef(false);

  // Helper logging
  const log = (msg: string) => {
    console.log(
      `%c[useVoiceChat] ${msg}`,
      "color: #00e5ff; font-weight: bold;"
    );
  };

  // -- Helpers (PCM/Base64) --
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

  // -- 1. Effect: Socket Connection --
  useEffect(() => {
    log(
      `🔄 Effect Dependencies Changed. Token: ${!!token}, SessionID: ${sessionId}, Model: ${model}`
    );

    if (!token || !sessionId) {
      log("🚫 Missing Token or SessionID. Skipping connection.");
      return;
    }

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
        log("⚡ Server confirmed Interrupt");
        isAssistantSpeakingRef.current = false;
      }
    };

    const handleOpen = () => {
      log("🟢 Hook detected Socket OPEN");
      setStatus("connected");
    };

    const handleClose = () => {
      log("🔴 Hook detected Socket CLOSE");
      disconnectMic();
      setStatus("disconnected");
      setSessionId(null);
    };

    const handleError = () => {
      log("⚠️ Hook detected Socket ERROR");
      setError("Connection lost");
      disconnectMic();
    };

    voiceSocketService.addEventListener("message", handleMessage);
    voiceSocketService.addEventListener("open", handleOpen);
    voiceSocketService.addEventListener("close", handleClose);
    voiceSocketService.addEventListener("error", handleError);

    log("🏁 Calling service.connect()...");
    setStatus("connecting");
    voiceSocketService.connect(token, sessionId, model);

    return () => {
      log("🧹 Cleanup: Unmounting effect. Disconnecting socket.");
      voiceSocketService.removeEventListener("message", handleMessage);
      voiceSocketService.removeEventListener("open", handleOpen);
      voiceSocketService.removeEventListener("close", handleClose);
      voiceSocketService.removeEventListener("error", handleError);
      voiceSocketService.disconnect();
    };
  }, [token, sessionId, model]);

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

  const disconnectMic = useCallback(() => {
    log("🎙️ Shutting down Microphone...");
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startSession = useCallback(async () => {
    log("▶️ startSession called");
    if (!token) {
      setError("Authentication missing");
      return;
    }

    try {
      setError(null);
      setStatus("initializing");

      log("⏳ Creating API Session...");
      const sessionData = await SessionService.createSession(
        token,
        model,
        provider,
        true
      );
      const newSessionId = sessionData.id || sessionData.session_id;
      log(`✅ API Session Created: ${newSessionId}`);

      // Init Audio
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass({ sampleRate: INPUT_SAMPLE_RATE });
      audioContextRef.current = ctx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!voiceSocketService.isReady) return;

        const inputData = e.inputBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setAudioLevel(rms);

        // Interrupt Logic
        if (rms > VAD_THRESHOLD && isAssistantSpeakingRef.current) {
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

      setSessionId(newSessionId);
    } catch (err: any) {
      console.error("Session Start Failed:", err);
      setError(err.message);
      disconnectMic();
      setStatus("disconnected");
    }
  }, [token, model, provider, disconnectMic]);

  const endSession = useCallback(() => {
    log("⏹️ endSession called");
    disconnectMic();
    voiceSocketService.disconnect();
    setSessionId(null);
    setStatus("disconnected");
  }, [disconnectMic]);

  return { status, audioLevel, error, startSession, endSession };
};

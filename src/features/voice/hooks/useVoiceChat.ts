import { useState, useEffect, useRef, useCallback } from "react";
import { voiceSocketService } from "../../../services/VoiceWebSocketService";
import { SessionService } from "../../../api/backendApi";

const INPUT_SAMPLE_RATE = 16000;
const SILENCE_THRESHOLD_MS = 2000; // Adjusted for snappier response
const VAD_THRESHOLD = 0.02; // Sensitivity

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
    | "processing"
  >("disconnected");

  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // --- CAPTION STATE ---
  const [caption, setCaption] = useState<string | null>(null);
  const captionBuffer = useRef<string>("");

  // --- AUDIO REFS ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  // Track all active sources to kill them instantly on interrupt
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // State Flags
  const isAssistantSpeakingRef = useRef(false);
  const silenceStartRef = useRef<number>(Date.now());
  const isUserSpeakingRef = useRef(false);

  // -- Helpers --
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

  // --- CRITICAL: INSTANTLY KILL AUDIO ---
  const cancelAudioPlayback = useCallback(() => {
    // 1. Stop all scheduled nodes immediately
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop(0);
        source.disconnect();
      } catch (e) {
        // Ignore errors if source already stopped
      }
    });
    activeSourcesRef.current = [];

    // 2. Reset clock to 'Now' so new audio doesn't schedule in the future
    if (audioContextRef.current) {
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }

    // 3. Reset Assistant Flag
    isAssistantSpeakingRef.current = false;
  }, []);

  // -- 1. Effect: Socket Connection --
  useEffect(() => {
    if (!token || !sessionId) return;

    const handleMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;

      // --- 1. Audio Handling ---
      if (data.type === "audio" && data.data) {
        // If user has already started speaking/interrupting, DISCARD incoming AI audio
        if (isUserSpeakingRef.current) return;

        setStatus("speaking");
        isAssistantSpeakingRef.current = true;
        playAudioChunk(data.data);
      }

      // --- 2. Turn Management ---
      else if (data.type === "input_audio_buffer.speech_started") {
        // Backend confirms user started speaking
        cancelAudioPlayback();
        captionBuffer.current = "";
        setCaption(null);
        setStatus("listening");
      }

      // --- 3. Speech Ended / Done ---
      else if (data.type === "response.done") {
        // Natural end of AI speech
        // We don't force stop here, we let the buffer play out
        isAssistantSpeakingRef.current = false;
        setStatus("connected");
      } else if (data.type === "interrupt" || data.type === "response.cancel") {
        cancelAudioPlayback();
        captionBuffer.current = "";
        setCaption(null);
        setStatus("connected");
      }

      // --- 4. CAPTIONS ---
      else if (data.type === "assistant_transcript") {
        const newText = data.text || "";
        if (newText) {
          captionBuffer.current += newText;
          setCaption(captionBuffer.current);
        }
      } else if (data.type === "response.audio_transcript.delta") {
        if (data.delta) {
          captionBuffer.current += data.delta;
          setCaption(captionBuffer.current);
        }
      } else if (
        data.type === "response.audio_transcript.done" ||
        data.type === "transcript"
      ) {
        const final = data.transcript || data.text;
        if (final) {
          captionBuffer.current = final;
          setCaption(final);
        }
      }
    };

    const handleOpen = () => {
      setStatus("connected");
    };

    const handleClose = () => {
      disconnectMic();
      setStatus("disconnected");
      setSessionId(null);
      setCaption(null);
    };

    const handleError = () => {
      setError("Connection lost");
      disconnectMic();
    };

    voiceSocketService.addEventListener("message", handleMessage);
    voiceSocketService.addEventListener("open", handleOpen);
    voiceSocketService.addEventListener("close", handleClose);
    voiceSocketService.addEventListener("error", handleError);

    voiceSocketService.connect(token, sessionId, model);

    return () => {
      voiceSocketService.removeEventListener("message", handleMessage);
      voiceSocketService.removeEventListener("open", handleOpen);
      voiceSocketService.removeEventListener("close", handleClose);
      voiceSocketService.removeEventListener("error", handleError);
      voiceSocketService.disconnect();
    };
  }, [token, sessionId, model, cancelAudioPlayback]);

  const playAudioChunk = (base64Data: string) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // Decode PCM
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

    // Jitter Buffer & Scheduling
    const currentTime = ctx.currentTime;

    // If we are starting a new phrase or lagged behind, reset clock + small buffer
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.05; // 50ms look-ahead buffer to prevent pops
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;

    // Track this source so we can kill it later
    activeSourcesRef.current.push(source);

    // Auto-cleanup on natural end
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter(
        (s) => s !== source
      );
    };
  };

  const disconnectMic = useCallback(() => {
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
    cancelAudioPlayback();
  }, [cancelAudioPlayback]);

  const startSession = useCallback(async () => {
    if (!token) {
      setError("Authentication missing");
      return;
    }

    try {
      setError(null);
      setStatus("initializing");

      const sessionData = await SessionService.createSession(
        token,
        model,
        provider,
        "",
        true
      );
      const newSessionId = sessionData.id || sessionData.session_id;

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
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      // Buffer Size 4096 gives ~0.25s latency block
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!voiceSocketService.isReady) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // VAD (RMS Calculation)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setAudioLevel(rms);

        // --- INTERRUPT LOGIC (High Priority) ---
        if (rms > VAD_THRESHOLD && isAssistantSpeakingRef.current) {
          // 1. Immediately kill local audio
          cancelAudioPlayback();

          // 2. Notify Backend
          voiceSocketService.sendInterrupt();

          // 3. Clear State Locally
          setCaption(null);
          captionBuffer.current = "";
          setStatus("listening");
        }

        // Send Audio
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = arrayBufferToBase64(pcm16.buffer);
        voiceSocketService.sendAudioChunk(base64);

        // --- COMMIT LOGIC ---
        if (rms > VAD_THRESHOLD) {
          silenceStartRef.current = Date.now();
          if (!isUserSpeakingRef.current) {
            isUserSpeakingRef.current = true;
            // Clear captions as soon as user starts talking
            setCaption(null);
            captionBuffer.current = "";
            setStatus("listening");
          }
        } else {
          const silenceDuration = Date.now() - silenceStartRef.current;
          if (
            isUserSpeakingRef.current &&
            silenceDuration > SILENCE_THRESHOLD_MS
          ) {
            voiceSocketService.sendCommit();
            isUserSpeakingRef.current = false;
            setStatus("processing"); // Optional visual feedback
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
  }, [token, model, provider, disconnectMic, cancelAudioPlayback]);

  const endSession = useCallback(() => {
    disconnectMic();
    voiceSocketService.disconnect();
    setSessionId(null);
    setStatus("disconnected");
    setCaption(null);
  }, [disconnectMic]);

  return { status, audioLevel, error, startSession, endSession, caption };
};

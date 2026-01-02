import React from "react";
import ParticleSphere from "../Components/ui/ParticleSphere";
import { Mic, PhoneOff } from "lucide-react";
import { useVoiceChat } from "../features/voice/hooks/useVoiceChat";
import { useAppSelector } from "../hooks/useRedux";
import ParticleBackground from "../Components/ui/ParticleBackground";
import { cn } from "../lib/utils";

// For createChat if needed
const Voice: React.FC = () => {
  // 1. Get Credentials from Redux
  const { accessToken, user } = useAppSelector((state: any) => state.auth);
  {
    user;
  } // for dev (vercel unused var fixed)

  // NOTE: might need to create a session ID first or pass one.
  const { isDark } = useAppSelector((state: any) => state.theme);

  // Get selected voice model from Redux
  const { voiceChatModel } = useAppSelector((state: any) => state.chat);

  // 2. Init Voice Hook with dynamic model
  const { status, audioLevel, error, startSession, endSession, caption } =
    useVoiceChat(
      accessToken,
      voiceChatModel.id, // Dynamic ID
      voiceChatModel.provider // Dynamic Provider
    );

  // Auto-start on mount (optional, or wait for button)
  // useEffect(() => { startSession(); return () => endSession(); }, []);

  const handleToggle = () => {
    if (status === "disconnected") {
      startSession();
    } else {
      endSession();
    }
  };

  // Visualizer props based on state
  const isActive =
    status === "speaking" || status === "listening" || status === "connected";

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      <ParticleBackground />
      {/* Header */}
      <div className="absolute top-10 z-10 text-center">
        <h2 className=" text-4xl font-extrabold tracking-widest uppercase">
          {status === "disconnected"
            ? "Ready"
            : status === "speaking"
            ? "AI Speaking"
            : "Listening..."}
        </h2>

        {/* Connection Badge */}
        <div
          className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono
          ${
            status === "connected"
              ? "bg-green-900/30 text-green-400"
              : "bg-gray-800 text-gray-400"
          }
        `}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              status === "connected"
                ? "bg-green-400 animate-pulse"
                : "bg-gray-500"
            }`}
          />
          {status.toUpperCase()}
        </div>

        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      </div>

      {/* 3D Sphere Visualizer */}
      <div className="w-full max-w-2xl h-[500px] flex items-center justify-center relative transition-all duration-700">
        <ParticleSphere
          count={isActive ? 1000 : 500}
          // Speed up when AI is speaking OR User is speaking (audioLevel high)
          speed={status === "speaking" ? 0.02 : 0.005 + audioLevel * 0.05}
          // Expand when loud
          size={isActive ? 0.5 + audioLevel * 0.8 : 0.5}
          // Color shift: Cyan for AI, Green for User, White for Idle
          color={
            status === "speaking"
              ? "#00ccff"
              : audioLevel > 0.05
              ? "#00ff88"
              : isDark
              ? "#fff"
              : "#000"
          }
        />

        {/* Caption Overlay */}
        {caption && status === "speaking" && (
          <div className="absolute bottom-10 w-[80%] text-center pointer-events-none z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span
              className={cn(
                "px-6 py-3 rounded-2xl text-lg md:text-xl font-medium shadow-2xl backdrop-blur-md",
                isDark
                  ? "bg-black/60 text-white/90 border border-white/10"
                  : "bg-white/60 text-black/90 border border-black/10"
              )}
            >
              {caption}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 z-20 flex flex-col items-center gap-6">
        {status === "connected" && (
          <div className="font-mono text-[10px] text-white/30 tracking-tighter">
            VAD ACTIVE • 3S SILENCE COMMIT
          </div>
        )}

        <button
          onClick={handleToggle}
          className={`
            hover:cursor-pointer relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-2xl
            ${
              isActive
                ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/30"
                : isDark
                ? "bg-white hover:bg-gray-100 shadow-white/10"
                : "bg-black hover:bg-gray-800 shadow-black/10"
            }
          `}
        >
          {/* Ping Ring */}
          {isActive && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
          )}

          {isActive ? (
            <PhoneOff className="text-white w-8 h-8" />
          ) : (
            <Mic
              className={cn(" w-8 h-8", isDark ? "text-black" : "  text-white")}
            />
          )}
        </button>

        <p className="text-white/40 text-sm font-light">
          {isActive ? "Tap to End Session" : "Tap to Start Conversation"}
        </p>
      </div>
    </div>
  );
};

export default Voice;

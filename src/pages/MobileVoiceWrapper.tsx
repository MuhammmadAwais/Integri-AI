import React from "react";
import { useParams } from "react-router-dom";
import Voice from "./Voice";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Captions, Moon, Sun } from "lucide-react";

// --- Actions ---
import { toggleTheme } from "../features/theme/themeSlice";
import { setVoiceShowCaptions } from "../features/chat/chatSlice";

const MobileVoiceWrapper: React.FC = () => {
  // Extract the JWT Token from the URL parameters
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();

  // --- Redux State ---
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const voiceShowCaptions = useAppSelector(
    (state: any) => state.chat.voiceShowCaptions
  );

  if (!token) {
    return (
      <div
        className={cn(
          "h-dvh w-full flex items-center justify-center font-mono",
          isDark ? "bg-black text-red-500" : "bg-white text-red-600"
        )}
      >
        <p>Error: Invalid Connection Token</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-dvh w-full overflow-hidden relative transition-colors duration-300",
        isDark ? "bg-black" : "bg-white"
      )}
    >
      {/* --- FLOATING NAVBAR OVERLAY --- */}
      {/* Positioned absolute at the top to float over the 3D scene */}
      <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-4 pointer-events-none">
        {/* Left: Caption Toggle */}
        <button
          onClick={() => dispatch(setVoiceShowCaptions(!voiceShowCaptions))}
          className={cn(
            "pointer-events-auto p-2 rounded-xl border transition-all hover:cursor-pointer backdrop-blur-md shadow-sm",
            voiceShowCaptions
              ? "bg-zinc-600 text-white border-zinc-500 shadow-lg shadow-indigo-500/20"
              : isDark
              ? "bg-black/20 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              : "bg-white/20 border-black/5 text-gray-600 hover:bg-black/5 hover:text-gray-900"
          )}
          title={voiceShowCaptions ? "Hide Captions" : "Show Captions"}
        >
          <Captions size={20} strokeWidth={voiceShowCaptions ? 2.5 : 2} />
        </button>

        {/* Right: Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className={cn(
            "pointer-events-auto p-2 rounded-xl border transition-all hover:cursor-pointer backdrop-blur-md shadow-sm",
            isDark
              ? "bg-black/20 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              : "bg-white/20 border-black/5 text-gray-600 hover:bg-black/5 hover:text-gray-900"
          )}
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* --- Main Voice Component --- */}
      <Voice overrideToken={token} />
    </div>
  );
};

export default MobileVoiceWrapper;

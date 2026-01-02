import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";
import { GripHorizontal, Pin, PinOff, X } from "lucide-react";
import { useAppDispatch } from "../../../hooks/useRedux";
import { setVoiceShowCaptions } from "../../chat/chatSlice";

interface CaptionsProps {
  text: string | null;
  status: string;
  isVisible: boolean;
}

const Captions: React.FC<CaptionsProps> = ({ text, status, isVisible }) => {
  const { isDark } = useAppSelector((state: any) => state.theme);
  const dispatch = useAppDispatch();

  // Internal State
  const [displayText, setDisplayText] = useState<string>("");
  const [showBox, setShowBox] = useState(false);

  // Modes: 'fixed' (docked above controls) or 'draggable' (floating)
  const [isFixed, setIsFixed] = useState(true);

  // Dragging State
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 150,
    y: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Update text with fade effects
  useEffect(() => {
    if (text) {
      setDisplayText(text);
      setShowBox(true);
    } else if (status !== "speaking") {
      // Delay fade out
      const timer = setTimeout(() => setShowBox(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [text, status]);

  // Handle Dragging Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = (e: React.MouseEvent) => {
    if (isFixed) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // If globally disabled from navbar, don't render anything
  if (!isVisible) return null;

  // We render even if text is empty to show the box if desired,
  // OR we can hide the box if no text.
  // The user said "menu box of caption", usually implies it's always there or fades.
  // Let's hide if no text AND not dragging to keep UI clean,
  // but if we are in 'draggable' mode, maybe we want to see the handle?
  // Let's stick to showing it when there is text or valid status.
  const shouldRender = showBox || displayText;

  const BoxContent = (
    <div
      className={cn(
        "z-[9999] transition-all duration-300 ease-in-out flex flex-col items-center",
        isFixed
          ? "absolute bottom-36 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px]" // Fixed position
          : "fixed w-[350px] md:w-[450px]" // Draggable position
      )}
      style={!isFixed ? { left: position.x, top: position.y } : {}}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl backdrop-blur-md shadow-2xl border overflow-hidden transition-opacity duration-500",
          !shouldRender
            ? "opacity-0 pointer-events-none scale-95"
            : "opacity-100 scale-100",
          isDark
            ? "bg-black/60 border-white/10 text-white"
            : "bg-white/80 border-black/5 text-black"
        )}
      >
        {/* Header Bar (Visible always for controls, but dragging only works if !isFixed) */}
        <div
          onMouseDown={startDrag}
          className={cn(
            "flex items-center justify-between px-3 py-2 border-b select-none",
            isFixed ? "cursor-default" : "cursor-move",
            isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"
          )}
        >
          <div className="flex items-center gap-2 opacity-50">
            {!isFixed && <GripHorizontal size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Live Captions
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFixed(!isFixed)}
              className={cn(
                "p-1.5 rounded-md transition-colors hover:cursor-pointer",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5"
              )}
              title={isFixed ? "Unpin (Enable Drag)" : "Pin to Bottom"}
            >
              {isFixed ? <PinOff size={14} /> : <Pin size={14} />}
            </button>

            <button
              onClick={() => dispatch(setVoiceShowCaptions(false))}
              className={cn(
                "p-1.5 rounded-md transition-colors hover:cursor-pointer hover:text-red-500",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5"
              )}
              title="Close Captions"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Caption Text Area */}
        <div className="px-6 py-4 min-h-[80px] flex items-center justify-center text-center">
          <p className="text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2">
            {displayText || (
              <span className="opacity-30 italic">Listening...</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );

  // If Draggable (Not Fixed), we use Portal to render outside the parent container layout
  if (!isFixed) {
    return createPortal(BoxContent, document.body);
  }

  // If Fixed, we render normally in the flow (which is absolute positioned in Voice.tsx)
  return BoxContent;
};

export default Captions;

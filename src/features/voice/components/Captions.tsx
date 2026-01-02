import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { GripHorizontal, Pin, PinOff, X } from "lucide-react";
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
    x: window.innerWidth / 2 - 200,
    y: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Ref for auto-scrolling
  const scrollContainerRef = useRef<HTMLParagraphElement>(null);

  // Update text & Visibility
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

  // AUTO-SCROLL LOGIC: Keep bottom 3 lines visible
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [displayText, isFixed, showBox]);

  // Handle Dragging Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Calculate new position
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;

      // Basic Boundary Checks (Keep on screen)
      const boxWidth = Math.min(500, window.innerWidth * 0.9); // Approximate width
      if (newX < 0) newX = 0;
      if (newX + boxWidth > window.innerWidth)
        newX = window.innerWidth - boxWidth;
      if (newY < 0) newY = 0;
      if (newY + 200 > window.innerHeight) newY = window.innerHeight - 200;

      setPosition({ x: newX, y: newY });
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
    // Adjust logic to handle touch/click accurately
    const rect = (
      e.currentTarget.closest(".draggable-box") as HTMLElement
    )?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // If globally disabled from navbar, don't render
  if (!isVisible) return null;

  const shouldRender = showBox || displayText;

  const BoxContent = (
    <div
      className={cn(
        "z-9999 transition-all duration-300 ease-in-out flex flex-col items-center draggable-box",
        isFixed
          ? "absolute bottom-36 left-1/2 -translate-x-1/2 w-[95%] md:w-[600px]" // Fixed: Centered, wider
          : "fixed w-[90vw] md:w-[500px]" // Draggable: Responsive width
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
            ? "bg-black/70 border-white/10 text-white shadow-black/50"
            : "bg-white/90 border-black/5 text-black shadow-xl"
        )}
      >
        {/* Header Bar */}
        <div
          onMouseDown={startDrag}
          className={cn(
            "flex items-center justify-between px-4 py-2 border-b select-none",
            isFixed ? "cursor-default" : "cursor-move",
            isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"
          )}
        >
          <div className="flex items-center gap-2 opacity-60">
            {!isFixed && <GripHorizontal size={16} />}
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Live Captions
            </span>
          </div>

          <div className="flex items-center gap-2">
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
                "p-1.5 rounded-md transition-colors hover:cursor-pointer hover:bg-red-500/10 hover:text-red-500"
              )}
              title="Close Captions"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Caption Text Area - Fixed Height for 3 Lines */}
        <div className="relative px-6 py-4">
          <p
            ref={scrollContainerRef}
            className={cn(
              "text-lg md:text-xl font-medium leading-[1.6em] text-center",
              // HEIGHT CALCULATION: 1.6em line-height * 3 lines = 4.8em
              "h-[4.8em]",
              "overflow-hidden overflow-y-auto scrollbar-hide scroll-smooth"
            )}
          >
            {displayText || (
              <span className="opacity-30 italic text-base">
                Listening for speech...
              </span>
            )}
          </p>

          {/* Subtle gradient to fade out top text if scrolling */}
          <div
            className={cn(
              "absolute top-12 left-0 w-full h-4 pointer-events-none",
              isDark
                ? "bg-linear-to-b from-black/0 to-transparent" // Adjust if needed
                : "bg-linear-to-b from-white/0 to-transparent"
            )}
          />
        </div>
      </div>
    </div>
  );

  // Portal for Draggable Mode to escape parent overflow/layout
  if (!isFixed) {
    return createPortal(BoxContent, document.body);
  }

  // Normal render for Fixed Mode
  return BoxContent;
};

export default Captions;

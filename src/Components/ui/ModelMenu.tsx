import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import AVAILABLE_MODELS from "../../../Constants";
import { Bot} from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";

interface ModelMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (id: string) => void;
  isDark: boolean;
  position?: "top" | "bottom";
  align?: "left" | "right";
}

export const ModalToggle = ({ isDark }: { isDark: boolean }) => {
  return (
    <Bot
      size={20}
      strokeWidth={1.5}
      className={isDark ? "text-gray-300" : "text-gray-600"}
    />
  );
};

const ModelMenu: React.FC<ModelMenuProps> = ({
  isOpen,
  onClose,
  selected,
  onSelect,
  isDark,
  position = "bottom",
  align = "right",
}) => {
  const [coords, setCoords] = useState<{
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  } | null>(null);

  // We use this ref to find the location of the trigger in the DOM
  const anchorRef = useRef<HTMLDivElement>(null);
    const user = useAppSelector((state: any) => state.auth.user);
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      // Find the parent element (the button/trigger)
      const parent = anchorRef.current.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();

        // Calculate position based on the trigger's coordinates
        const newCoords: any = {};

        // Horizontal Alignment
        if (align === "left") {
          newCoords.left = rect.left;
        } else {
          // Align right edge of menu with right edge of trigger
          // We calculate 'left' for stability, assuming menu width is 280px
          newCoords.left = rect.right - 280;
        }

        // Vertical Positioning
        if (position === "bottom") {
          // "bottom" prop in your code used 'bottom-full', meaning it renders ABOVE the trigger
          // So we set the 'bottom' style to the distance from viewport bottom to trigger top
          newCoords.bottom = window.innerHeight - rect.top + 8; // +8 for mb-2 margin
          newCoords.top = "auto";
        } else {
          // "top" prop in your code used 'top-full', meaning it renders BELOW the trigger
          newCoords.top = rect.bottom + 8; // +8 for mt-2 margin
          newCoords.bottom = "auto";
        }

        setCoords(newCoords);
      }
    }
  }, [isOpen, align, position]);

  // Keep the anchor in the DOM so we know where to calculate from
  if (!isOpen) return <div ref={anchorRef} className="hidden" />;

  // Render the actual menu into the body using a Portal
  return (
    <>
      <div ref={anchorRef} className="hidden" />
      {createPortal(
        <div
          className="font-sans text-base antialiased"
          style={{ zIndex: 99999 }}
        >
          {/* FIX: Backdrop to handle "Click Outside". 
              Uses fixed inset-0 to cover the whole screen.
          */}
          <div
            className="fixed inset-0 bg-transparent cursor-default"
            style={{ zIndex: 99998 }}
            onClick={onClose}
          />

          {/* Menu Container */}
          <div
            style={{
              position: "fixed",
              ...coords,
              zIndex: 99999,
            }}
            className={cn(
              "w-[280px] flex flex-col p-1.5",
              "animate-in zoom-in-95 duration-100 ease-out",
              "rounded-2xl border shadow-2xl overflow-hidden",

              // Dynamic Positioning classes for Transform Origin only
              // (Actual positioning is handled by the style prop now)
              position === "bottom"
                ? align === "left"
                  ? "origin-bottom-left"
                  : "origin-bottom-right"
                : align === "left"
                ? "origin-top-left"
                : "origin-top-right",

              // Theme Colors
              isDark
                ? "bg-[#18181b] border-[#27272a] shadow-black/50"
                : "bg-white border-gray-200 shadow-xl"
            )}
          >
            <div className="max-h-80 overflow-y-auto custom-scrollbar relative">
              <div
                className={cn(
                  "px-2 py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 mb-1 backdrop-blur-md",
                  isDark
                    ? "bg-[#18181b]/95 text-gray-500 border-b border-[#27272a]"
                    : "bg-white/95 text-gray-400 border-b border-gray-100"
                )}
              >
                Available Models
              </div>

              {AVAILABLE_MODELS.map((m) => {
                const isSelected = m.id === selected;
                return (
                  <button
                    key={m.id}
                    disabled={!user?.isPremium && m.isPremium}
                    onClick={() => {
                      onSelect(m.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group mb-0.5 relative ",
                      user?.isPremium || !m.isPremium ? "hover:cursor-pointer" : "hover:cursor-not-allowed",
                      isSelected
                        ? isDark
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-indigo-50 text-indigo-600"
                        : isDark
                        ? "text-gray-300 hover:bg-[#27272a]"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div>
                      <img src={isDark ? `/${m.dark_theme_logo}` : `/${m.light_theme_logo}`} alt="logo" className="w-6 h-6 shrink-0"  />
                      <div className="font-medium">{m.label || m.id}</div>
                      <div className="text-[10px] opacity-60 capitalize flex items-center gap-1.5">
                        {m.alt_provider || m.provider}
                        {m.badge && (
                          <span
                            className={cn(
                              "px-1 rounded-[3px] text-[9px] font-medium leading-none py-0.5",
                              isDark
                                ? "bg-gray-800 text-gray-400"
                                : "bg-gray-200 text-gray-600"
                            )}
                          >
                            {m.badge}
                          </span>
                        )}
                      </div>
                      
                    </div>

                   { m.isPremium && 
                    <img src="/crown_icon.png" alt="Premium" className="w-4 h-4 shrink-0"/>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ModelMenu;

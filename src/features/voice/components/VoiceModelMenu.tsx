import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";
import { VOICE_MODELS } from "../../../../Constants";
import { Check, Mic } from "lucide-react";

interface VoiceModelMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string, provider: string) => void;
  isDark: boolean;
  position?: "top" | "bottom";
  align?: "left" | "right";
}

const VoiceModelMenu: React.FC<VoiceModelMenuProps> = ({
  isOpen,
  onClose,
  selectedId,
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

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const trigger = document.activeElement as HTMLElement;
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        const MENU_HEIGHT = 250; // Approximate max height
        const VIEWPORT_HEIGHT = window.innerHeight;

        let newCoords: any = {};

        // --- 1. Vertical Positioning Logic (Smart Flip) ---
        let finalPosition = position;

        // If we want to show on TOP, but there's no space (< 250px space above), flip to BOTTOM
        if (position === "top" && rect.top < MENU_HEIGHT) {
          finalPosition = "bottom";
        }
        // If we want to show on BOTTOM, but there's no space (< 250px space below), flip to TOP
        else if (
          position === "bottom" &&
          VIEWPORT_HEIGHT - rect.bottom < MENU_HEIGHT
        ) {
          finalPosition = "top";
        }

        // Apply Coordinates based on Final Position
        if (finalPosition === "top") {
          // Bottom is distance from bottom of screen to top of trigger
          newCoords.bottom = VIEWPORT_HEIGHT - rect.top + 8;
        } else {
          // Top is distance from top of screen to bottom of trigger
          newCoords.top = rect.bottom + 8;
        }

        // --- 2. Horizontal Positioning Logic ---
        if (align === "right") {
          newCoords.left = rect.right - 240;
        } else {
          newCoords.left = rect.left;
        }

        // Safety Clamp (Prevent Horizontal Overflow)
        if (newCoords.left < 10) newCoords.left = 10;
        if (newCoords.left + 240 > window.innerWidth) {
          newCoords.left = window.innerWidth - 250;
        }

        setCoords(newCoords);
      }
    }
  }, [isOpen, position, align]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-9998 bg-transparent"
        onClick={onClose}
      />
      <div
        ref={menuRef}
        className={cn(
          "fixed z-9999 w-60 rounded-xl border p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100",
          isDark ? "bg-[#121212] border-zinc-800" : "bg-white border-zinc-200"
        )}
        style={{
          top: coords?.top,
          left: coords?.left,
          bottom: coords?.bottom,
        }}
      >
        <div className="px-2 py-1.5 mb-1 text-xs font-semibold uppercase tracking-wider opacity-50">
          Select Voice Model
        </div>
        <div className="space-y-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
          {VOICE_MODELS.map((m) => {
            const isSelected = selectedId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id, m.provider)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                  isSelected
                    ? isDark
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "bg-indigo-50 text-indigo-600"
                    : isDark
                    ? "text-gray-300 hover:bg-[#27272a]"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-md",
                      isSelected
                        ? "bg-indigo-500/20"
                        : isDark
                        ? "bg-zinc-800"
                        : "bg-gray-100"
                    )}
                  >
                    <Mic size={14} />
                  </div>
                  <div>
                    <div className="font-medium">{m.label}</div>
                    <div className="text-[10px] opacity-60 capitalize">
                      {m.badge || m.provider}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check size={14} className="shrink-0 stroke-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
};

export default VoiceModelMenu;

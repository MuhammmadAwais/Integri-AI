import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Undo,
  Redo,
  Trash2,
  Check,
  PenTool,
  Eraser,
} from "lucide-react";
import { cn } from "../../lib/utils"; // Adjust path as needed based on your structure

interface WhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (file: File) => void;
  isDark: boolean;
}

const COLORS = [
  "#ffffff", // White
  "#000000", // Black
  "#ef4444", // Red
  "#f59e0b", // Orange/Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
];

const WhiteboardModal: React.FC<WhiteboardModalProps> = ({
  isOpen,
  onClose,
  onDone,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(isDark ? "#ffffff" : "#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
    {setLineWidth}//for dev (vercel fix)
  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize Canvas
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow the DOM to render the portal content
      const timer = setTimeout(() => {
        setupCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      // Set actual pixel dimensions to match display dimensions for sharpness
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Fill background based on theme immediately so it's not transparent
        ctx.fillStyle = isDark ? "#18181b" : "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        saveHistory(); // Save initial blank state
      }
    }
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      // Debounce resize could be added here for performance
      if (isOpen) setupCanvas();
      // Note: Resizing currently clears the canvas.
      // A more complex implementation would redraw the history.
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, isDark]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(imageData);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.putImageData(history[newStep], 0, 0);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.fillStyle = isDark ? "#18181b" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveHistory();
    }
  };

  // --- Drawing Handlers ---
  const getCoordinates = (
    event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop scrolling on mobile while drawing
    // e.preventDefault();

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle =
        tool === "eraser" ? (isDark ? "#18181b" : "#ffffff") : color;
      ctx.lineWidth = tool === "eraser" ? 20 : lineWidth;
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `sketch_${Date.now()}.png`, {
            type: "image/png",
          });
          onDone(file);
          onClose();
        }
      });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-6xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col",
          isDark ? "bg-[#18181b]" : "bg-white"
        )}
      >
        {/* Header / Close Button */}
        <button
        title="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 z-50 p-2 rounded-full transition-colors",
            isDark
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-black/5 hover:bg-black/10 text-black"
          )}
        >
          <X size={24} />
        </button>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full relative cursor-crosshair touch-none"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block w-full h-full"
          />
        </div>

        {/* Bottom Toolbar (Floating) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto">
          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border",
              isDark
                ? "bg-[#27272a]/90 border-white/10 backdrop-blur-md"
                : "bg-white/90 border-gray-200 backdrop-blur-md"
            )}
          >
            {/* Colors */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-500/20">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool("pen");
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    color === c && tool === "pen"
                      ? "border-indigo-500 scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            {/* Tools */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-500/20">
              <button
                onClick={() => setTool("pen")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  tool === "pen"
                    ? "bg-indigo-500 text-white"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                )}
                title="Pen"
              >
                <PenTool size={18} />
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  tool === "eraser"
                    ? "bg-indigo-500 text-white"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                )}
                title="Eraser"
              >
                <Eraser size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-500/20">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark
                    ? "text-gray-400 hover:text-white disabled:opacity-30"
                    : "text-gray-500 hover:text-black disabled:opacity-30"
                )}
                title="Undo"
              >
                <Undo size={18} />
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark
                    ? "text-gray-400 hover:text-white disabled:opacity-30"
                    : "text-gray-500 hover:text-black disabled:opacity-30"
                )}
                title="Redo"
              >
                <Redo size={18} />
              </button>
              <button
                onClick={clearCanvas}
                className={cn(
                  "p-2 rounded-lg transition-colors hover:text-red-500",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
                title="Clear All"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Done Button */}
            <button
              onClick={handleDone}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Check size={16} />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhiteboardModal;

import React, { useState, useRef, useEffect } from "react";
import { Download, PenTool, X, RefreshCw, Maximize2 } from "lucide-react";

interface ImagePreviewProps {
  imageSrc: string;
  prompt: string;
  isDark: boolean;
  isLoading: boolean;
  onDownload: () => void;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageSrc,
  prompt,
  isDark,
  isLoading,
  onDownload,
  onClose,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Drawing State
  const [isDrawingActive, setIsDrawingActive] = useState(false);

  // Initialize Canvas when image loads or window resizes
  useEffect(() => {
    if (imageLoaded && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      // Match canvas size to container (which matches image)
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        contextRef.current = ctx;
      }
    }
  }, [imageLoaded, isDrawing]);

  // Handle Drawing
  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawingActive(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawingActive || !isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawingActive(false);
  };
  console.log(imageSrc  );
  return (
    <div className="flex flex-col h-full w-full p-4 md:p-8">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2
            className={`font-bold text-lg ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            Result
          </h2>
          <p
            className={`text-xs truncate max-w-[200px] md:max-w-md ${
              isDark ? "text-zinc-500" : "text-zinc-500"
            }`}
          >
            {prompt}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && (
            <>
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                title="Toggle Markup"
                className={`p-2 rounded-lg border transition-all ${
                  isDrawing
                    ? "bg-red-500 border-red-500 text-white"
                    : isDark
                    ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    : "border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                }`}
              >
                <PenTool size={18} />
              </button>
              <button
                onClick={onDownload}
                title="Download"
                className={`p-2 rounded-lg border transition-all ${
                  isDark
                    ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    : "border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                }`}
              >
                <Download size={18} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            title="Close Preview"
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                : "border-zinc-200 hover:bg-zinc-100 text-zinc-700"
            }`}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div
        className={`flex-1 relative rounded-2xl overflow-hidden border flex items-center justify-center
        ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
        }`}
      >
        {isLoading ? (
          // Skeleton State
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-t-transparent border-zinc-500 rounded-full animate-spin"></div>
            <span
              className={`text-sm font-medium ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              Generating masterpiece...
            </span>
          </div>
        ) : (
          // Image Container
          <div
            ref={containerRef}
            className="relative max-h-full max-w-full shadow-2xl"
          >
            {/* FIX: We use the src as a key to force re-mounting if the URL changes,
                    ensuring onLoad fires correctly every time. 
                 */}
            <img
              key={imageSrc}
              src={imageSrc}
              alt="Generated Content"
              onLoad={() => setImageLoaded(true)}
              className="max-h-[calc(100vh-200px)] max-w-full object-contain rounded-lg"
            />

            {/* Canvas Overlay for Markup */}
            {isDrawing && (
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="absolute inset-0 cursor-crosshair touch-none"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;

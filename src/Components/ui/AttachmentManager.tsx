import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFileStatuses } from '../../hooks/useFileStatuses';

interface AttachmentProps {
  attachments: { name: string; type: "image" | "file"; url: string }[];
  isDark: boolean;
}

export const AttachmentGrid: React.FC<AttachmentProps> = ({ attachments, isDark }) => {
  const [expanded, setExpanded] = useState(false);
  const { statuses, thinkingFiles } = useFileStatuses(attachments);

  if (!attachments || attachments.length === 0) return null;

  // Separate images and files to apply different layouts
  const images = attachments.filter(a => a.type === 'image');
  const files = attachments.filter(a => a.type !== 'image');

  // Handle image overflow
  const showMoreImages = !expanded && images.length > 4;
  const visibleImages = showMoreImages ? images.slice(0, 3) : images;

  return (
    <div className="mb-3 flex flex-col gap-3">
      {/* --- IMAGE GALLERY --- */}
      {images.length > 0 && (
        <div className={cn(
          "w-full max-w-[300px] sm:max-w-[440px]",
          images.length === 1 ? "" : "grid grid-cols-2 gap-2"
        )}>
          {visibleImages.map((att, idx) => {
            const isProcessed = statuses[att.name] === 'processed';
            const isThinking = thinkingFiles[att.name];
            const isProcessingOrThinking = !isProcessed || isThinking;

            return (
              <div 
                key={idx}
                className={cn(
                  "relative overflow-hidden group/att",
                  images.length === 1 ? "rounded-2xl max-h-[300px]" : "aspect-square rounded-xl shadow-sm",
                  isDark ? "border-white/10" : "border-black/5 border",
                  isProcessingOrThinking && 'animate-pulse opacity-70 cursor-wait'
                )}
                aria-label={`${att.name} - ${isProcessingOrThinking ? 'Processing' : 'Ready'}`}
              >
                {isProcessingOrThinking ? (
                  <div className={cn("w-full h-full min-h-[120px] flex items-center justify-center", isDark ? "bg-white/5" : "bg-black/5")}>
                    <FileText size={24} className="opacity-20" />
                  </div>
                ) : (
                  <img 
                    src={att.url} 
                    alt={att.name} 
                    className={cn(
                      "w-full h-full object-cover block transition-transform duration-300 group-hover/att:scale-105",
                      images.length === 1 ? "" : "aspect-square"
                    )}
                  />
                )}
                
                {/* Overlay for filename for images on hover (only if active) */}
                {!isProcessingOrThinking && (
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 group-hover/att:opacity-100 transition-opacity duration-200">
                    <p className="text-xs text-white font-medium truncate">{att.name}</p>
                  </div>
                )}
              </div>
            )
          })}

          {showMoreImages && (
            <button 
              onClick={() => setExpanded(true)}
              className={cn(
                "relative aspect-square rounded-xl border flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-500",
                isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-gray-50"
              )}
              aria-label={`Show ${images.length - 3} more images`}
            >
              <span className="text-xl font-bold text-indigo-500">+{images.length - 3}</span>
              <span className="text-[10px] font-medium opacity-70 mt-1 uppercase tracking-wider">More</span>
            </button>
          )}
        </div>
      )}

      {/* --- FILE CARDS --- */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 max-w-[280px] sm:max-w-[340px]">
          {files.map((att, idx) => {
            const isProcessed = statuses[att.name] === 'processed';
            const isThinking = thinkingFiles[att.name];
            const isProcessingOrThinking = !isProcessed || isThinking;

            return (
              <div
                key={`file-${idx}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-colors",
                  isDark
                    ? "bg-[#1F1D25]/80 border-white/5 backdrop-blur-md"
                    : "bg-white border-gray-200/60 backdrop-blur-md",
                  isProcessingOrThinking && 'animate-pulse opacity-70 cursor-wait'
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg shrink-0 flex items-center justify-center",
                    isDark ? "bg-black/30" : "bg-gray-100"
                  )}
                >
                  <FileText size={20} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className={cn(
                    "text-sm font-semibold truncate leading-tight",
                    isDark ? "text-gray-200" : "text-gray-800"
                  )}>
                    {att.name}
                  </p>
                  <p className="text-[11px] font-medium opacity-60 mt-0.5 uppercase tracking-wider">
                    {att.name.split('.').pop() || 'FILE'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AttachmentStatusList: React.FC<AttachmentProps> = ({ attachments }) => {
  const { statuses, thinkingFiles } = useFileStatuses(attachments);

  if (!attachments || attachments.length === 0) return null;

  const processingAttachments = attachments.filter(att => statuses[att.name] !== 'processed' || thinkingFiles[att.name]);

  if (processingAttachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2 pl-2">
      {processingAttachments.map(att => {
         const isThinking = thinkingFiles[att.name];
         const text = isThinking ? "Thinking..." : `Processing ${att.name}...`;
         return (
            <div key={att.name} className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
               <div className="animate-spin h-3 w-3 border-[1.5px] border-indigo-400 border-t-indigo-600 rounded-full shrink-0" />
               <span className="truncate max-w-[200px]">{text}</span>
            </div>
         );
      })}
    </div>
  );
};

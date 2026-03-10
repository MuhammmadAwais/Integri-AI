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

  const showMoreToken = !expanded && attachments.length > 4;
  const visibleAttachments = showMoreToken ? attachments.slice(0, 3) : attachments;

  return (
    <div className="mb-3 grid gap-2 grid-cols-[repeat(auto-fill,minmax(120px,1fr))] max-w-[300px] sm:max-w-[440px]">
      {visibleAttachments.map((att, idx) => {
        const isProcessed = statuses[att.name] === 'processed';
        const isThinking = thinkingFiles[att.name];
        const isProcessingOrThinking = !isProcessed || isThinking;

        return (
          <button 
             key={idx}
             className={cn(
               "relative aspect-square rounded-xl overflow-hidden shadow-sm group/att focus:outline-none focus:ring-2 focus:ring-indigo-500",
               isDark ? "border-white/10" : "border-black/10",
               att.type !== 'image' && 'border',
               isProcessingOrThinking && 'animate-pulse opacity-70 cursor-wait'
             )}
             aria-label={`${att.name} - ${isProcessingOrThinking ? 'Processing' : 'Ready'}`}
             disabled={isProcessingOrThinking}
          >
            {att.type === 'image' ? (
              <>
                 {isProcessingOrThinking ? (
                    <div className={cn("w-full h-full flex items-center justify-center", isDark ? "bg-white/5" : "bg-black/5")}>
                       <FileText size={24} className="opacity-20" />
                    </div>
                 ) : (
                    <img 
                       src={att.url} 
                       alt={att.name} 
                       className="w-full h-full object-cover transition-transform duration-300 group-hover/att:scale-105 block" 
                    />
                 )}
              </>
            ) : (
              <div
                className={cn(
                  "flex flex-col w-full h-full items-center justify-center text-center p-3 transition-colors",
                  isDark
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-white hover:bg-gray-50",
                  isProcessingOrThinking && (isDark ? 'bg-white/10' : 'bg-gray-100')
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg mb-2 shadow-sm shrink-0",
                    isDark ? "bg-black/30" : "bg-gray-100"
                  )}
                >
                  <FileText size={20} className="text-indigo-500" />
                </div>
                <div className="flex-1 w-full flex flex-col justify-center items-center overflow-hidden">
                  <p className="text-[11px] font-semibold leading-tight line-clamp-2 w-full px-1 pt-1">
                    {att.name}
                  </p>
                </div>
              </div>
            )}
            
            {/* Overlay for filename for images on hover (only if active) */}
            {att.type === 'image' && !isProcessingOrThinking && (
               <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 opacity-0 group-hover/att:opacity-100 transition-opacity duration-200">
                  <p className="text-[10px] text-white font-medium truncate">{att.name}</p>
               </div>
            )}
          </button>
        )
      })}

      {showMoreToken && (
        <button 
           onClick={() => setExpanded(true)}
           className={cn(
              "relative aspect-square rounded-xl border flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-500",
              isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-gray-50"
           )}
           aria-label={`Show ${attachments.length - 3} more files`}
        >
           <span className="text-xl font-bold text-indigo-500">+{attachments.length - 3}</span>
           <span className="text-[10px] font-medium opacity-70 mt-1 uppercase tracking-wider">More</span>
        </button>
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

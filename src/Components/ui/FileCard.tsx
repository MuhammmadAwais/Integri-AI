import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppSelector } from '../../hooks/useRedux';

interface FileCardProps {
  id: string; // The file ID or a unique key from attachment
  attachment?: {
    name: string;
    type: "image" | "file";
    url: string;
  };
}

export const FileCard: React.FC<FileCardProps> = ({ attachment }) => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  
  if (attachment) {
    if (attachment.type === 'image') {
      return (
        <div className={cn(
          "relative aspect-square rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:scale-[1.02]",
          isDark ? "border-white/10" : "border-black/5 border"
        )}>
          <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 hover:opacity-100 transition-opacity flex justify-between items-end">
            <p className="text-xs text-white font-medium truncate">{attachment.name}</p>
          </div>
        </div>
      );
    }
    
    return (
       <div className={cn(
         "flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-transform duration-300 hover:scale-[1.02]",
         isDark ? "bg-[#2A2B32]/80 border-white/5" : "bg-white border-gray-200/60"
       )}>
          <div className={cn("p-2.5 rounded-lg shrink-0 flex items-center justify-center", isDark ? "bg-black/30" : "bg-gray-100")}>
            <FileText size={20} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className={cn("text-sm font-semibold truncate leading-tight", isDark ? "text-gray-200" : "text-gray-800")}>{attachment.name}</p>
            <p className="text-[11px] font-medium opacity-60 mt-0.5 uppercase tracking-wider">{attachment.name.split('.').pop() || 'FILE'}</p>
          </div>
       </div>
    );
  }

  // Backup loading/unknown state if only ID is present and we haven't fetched details
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border shadow-sm animate-pulse",
      isDark ? "bg-[#2A2B32]/80 border-white/5" : "bg-white border-gray-200/60"
    )}>
       <div className={cn("p-2.5 rounded-lg shrink-0 flex items-center justify-center", isDark ? "bg-black/30" : "bg-gray-100")}>
         <FileText size={20} className="text-gray-400" />
       </div>
       <div className="flex-1 min-w-0 pr-2 flex flex-col gap-1.5">
         <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
         <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
       </div>
    </div>
  );
};

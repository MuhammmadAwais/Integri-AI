import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { FileCard } from './FileCard';

interface FileGalleryProps {
  file_ids?: string[];
  attachments?: {
    name: string;
    type: "image" | "file";
    url: string;
  }[];
}

export const FileGallery: React.FC<FileGalleryProps> = ({ file_ids, attachments }) => {
  const displayItems = useMemo(() => {
    const items: Array<{ id: string; attachment?: any }> = [];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach((att, index) => {
        items.push({
          id: file_ids?.[index] || `local-att-${index}`, 
          attachment: att,
        });
      });
    } else if (file_ids && file_ids.length > 0) {
      file_ids.forEach((id) => {
        items.push({
          id,
        });
      });
    }
    
    return items;
  }, [file_ids, attachments]);

  if (displayItems.length === 0) return null;

  return (
    <div className="mb-3 w-full max-w-[300px] sm:max-w-[440px] min-h-[140px]">
      <div className={cn(
        "w-full",
        displayItems.length > 1 ? "grid grid-cols-2 gap-2" : "flex flex-col"
      )}>
        {displayItems.map((item) => (
          <FileCard key={item.id} id={item.id} attachment={item.attachment} />
        ))}
      </div>
    </div>
  );
};

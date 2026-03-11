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
  // Use file_ids as the source of truth if available.
  // We map over whichever array has the files. If both exist, we can pair them up.
  const displayItems = useMemo(() => {
    const items: Array<{ id: string; attachment?: any }> = [];
    
    if (file_ids && file_ids.length > 0) {
      file_ids.forEach((id, index) => {
        items.push({
          id,
          // Pair with local attachment preview if available at the same index
          attachment: attachments?.[index],
        });
      });
    } else if (attachments && attachments.length > 0) {
      attachments.forEach((att, index) => {
        items.push({
          id: `local-att-${index}`, // Temporary ID for optimistic rendering
          attachment: att,
        });
      });
    }
    
    return items;
  }, [file_ids, attachments]);

  if (displayItems.length === 0) return null;

  return (
    <div className="mb-3 w-full max-w-[300px] sm:max-w-[440px]">
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

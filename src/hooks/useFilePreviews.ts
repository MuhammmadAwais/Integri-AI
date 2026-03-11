import { useState, useEffect } from 'react';

export function useFilePreviews(files: File[]) {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    const newPreviews: Record<string, string> = {};
    const objectUrls: string[] = [];

    files.forEach((file) => {
      // Create a unique key for the file
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newPreviews[key] = url;
        objectUrls.push(url);
      }
    });

    setPreviews(newPreviews);

    // Cleanup function to revoke old URLs when files change or unmount
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return previews;
}

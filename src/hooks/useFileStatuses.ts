import { useState, useEffect } from 'react';
import { fileStatusTracker, type FileStatus } from '../utils/fileUploadTracker';

export function useFileStatuses(attachments?: any[]) {
  const [statuses, setStatuses] = useState<Record<string, FileStatus>>(() => {
    const init: Record<string, FileStatus> = {};
    if (attachments) {
      attachments.forEach(att => {
        init[att.name] = fileStatusTracker.getStatus(att.name) || 'processed';
      });
    }
    return init;
  });

  const [thinkingFiles, setThinkingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!attachments || attachments.length === 0) return;

    const handler = (e: any) => {
      const { fileKey, status } = e.detail;
      if (attachments.some(a => a.name === fileKey)) {
        if (status === 'processed') {
          // Transition to thinking state for ~600ms before finalizing
          setThinkingFiles(prev => ({ ...prev, [fileKey]: true }));
          setStatuses(prev => ({ ...prev, [fileKey]: 'processing' }));
          
          setTimeout(() => {
            setThinkingFiles(prev => ({ ...prev, [fileKey]: false }));
            setStatuses(prev => ({ ...prev, [fileKey]: 'processed' }));
          }, 600);
        } else {
          setStatuses(prev => ({ ...prev, [fileKey]: status }));
        }
      }
    };

    window.addEventListener('file-upload-status', handler);
    return () => window.removeEventListener('file-upload-status', handler);
  }, [attachments]);

  return { statuses, thinkingFiles };
}

export type FileStatus = 'uploading' | 'uploaded_not_processed' | 'processing' | 'processed' | 'failed';

class FileUploadTracker {
  private statuses: Map<string, FileStatus> = new Map();

  setStatus(fileKey: string, status: FileStatus) {
    this.statuses.set(fileKey, status);
    window.dispatchEvent(
      new CustomEvent('file-upload-status', {
        detail: { fileKey, status },
      })
    );
  }

  getStatus(fileKey: string): FileStatus | undefined {
    return this.statuses.get(fileKey);
  }
}

export const fileStatusTracker = new FileUploadTracker();

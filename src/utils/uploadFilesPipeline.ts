import { FileService } from "../api/backendApi";
import { fileStatusTracker } from "./fileUploadTracker";

/**
 * Runs the 4-step file upload pipeline for a single file:
 * 1. Get pre-signed S3 upload URL
 * 2. PUT file bytes directly to S3
 * 3. POST to /files/process to trigger background OCR
 * 4. Poll /files/{id} until processing_status === "ready"
 *
 * @param token  - Auth bearer token
 * @param file   - The File object to upload
 * @param sessionId - The session this file belongs to (required by backend)
 * @returns      - The ready file_id string
 * @throws       - If any step fails
 */
export async function uploadSingleFile(
  token: string,
  file: File,
  sessionId: string
): Promise<string> {
  const fileKey = file.name;
  
  try {
    // Step 1: Get presigned S3 URL
    console.log(`📤 [uploadPipeline] Step 1: Getting upload URL for ${file.name}...`);
    fileStatusTracker.setStatus(fileKey, 'uploading');
    const { url: s3UploadUrl, s3_key } = await FileService.getUploadUrl(
      token,
      file.name,
      file.type || "application/octet-stream"
    );

    // Step 2: Upload directly to S3 (no auth headers)
    console.log(`📤 [uploadPipeline] Step 2: Uploading ${file.name} to S3...`);
    await FileService.uploadToS3(s3UploadUrl, file);

    fileStatusTracker.setStatus(fileKey, 'uploaded_not_processed');

    // Step 3: Trigger background OCR processing, scoped to this specific session
    console.log(`📤 [uploadPipeline] Step 3: Triggering processing for ${file.name} in session ${sessionId}...`);
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || file.type.split("/")[1] || "bin";
    const fileId = await FileService.processFile(
      token,
      s3_key,
      file.name,
      fileExtension,
      sessionId
    );

    fileStatusTracker.setStatus(fileKey, 'processing');

    // Step 4: Poll until status === "ready"
    console.log(`📤 [uploadPipeline] Step 4: Polling status for ${file.name} (id: ${fileId})...`);
    const readyFileId = await FileService.pollFileStatus(token, fileId);

    fileStatusTracker.setStatus(fileKey, 'processed');
    console.log(`✅ [uploadPipeline] File ready: ${file.name} → file_id: ${readyFileId}`);
    return readyFileId;
  } catch (error) {
    fileStatusTracker.setStatus(fileKey, 'failed');
    throw error;
  }
}

/**
 * Runs the 4-step pipeline for an array of files sequentially (one by one).
 * If any file fails, throws immediately — halting the rest.
 *
 * @param token     - Auth bearer token
 * @param files     - Array of File objects
 * @param sessionId - The session these files belong to
 * @returns         - Array of ready file_id strings
 * @throws          - If any file fails at any step
 */
export async function uploadFilesSequentially(
  token: string,
  files: File[],
  sessionId: string
): Promise<string[]> {
  const fileIds: string[] = [];

  for (const file of files) {
    // uploadSingleFile already throws on failure — this loop stops immediately
    const readyId = await uploadSingleFile(token, file, sessionId);
    fileIds.push(readyId);
  }

  return fileIds;
}

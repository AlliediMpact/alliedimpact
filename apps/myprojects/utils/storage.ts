import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getApp } from 'firebase/app';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
}

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const storage = getStorage(getApp());
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}_${sanitizedFileName}`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress: Math.round(progress),
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: `${path}/${fileName}`,
            fileName: file.name,
            size: file.size,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Upload multiple files to Firebase Storage
 */
export async function uploadMultipleFiles(
  files: File[],
  path: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, path, (progress) => {
      onProgress?.(index, progress);
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  const storage = getStorage(getApp());
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
}

/**
 * Delete multiple files from Firebase Storage
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<void> {
  const deletePromises = filePaths.map(path => deleteFile(path));
  await Promise.all(deletePromises);
}

/**
 * Get storage path for project deliverables
 */
export function getDeliverablePath(projectId: string, deliverableId: string): string {
  return `projects/${projectId}/deliverables/${deliverableId}`;
}

/**
 * Get storage path for ticket attachments
 */
export function getTicketAttachmentPath(projectId: string, ticketId: string): string {
  return `projects/${projectId}/tickets/${ticketId}`;
}

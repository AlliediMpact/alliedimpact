'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { X, Upload, FileText, Trash2 } from 'lucide-react';

interface FileUploadModalProps {
  deliverableId: string;
  deliverableName: string;
  projectId: string;
  onClose: () => void;
  onSuccess: (fileUrls: string[]) => void;
}

export function FileUploadModal({ 
  deliverableId, 
  deliverableName, 
  projectId, 
  onClose, 
  onSuccess 
}: FileUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { getApp } = await import('firebase/app');
      
      const storage = getStorage(getApp());
      const uploadPromises = files.map(async (file) => {
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `projects/${projectId}/deliverables/${deliverableId}/${timestamp}_${sanitizedFileName}`;
        const storageRef = ref(storage, filePath);
        
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const fileUrls = await Promise.all(uploadPromises);
      onSuccess(fileUrls);
      onClose();
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upload Files</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{deliverableName}</p>
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                id="file-upload-modal"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload-modal"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-sm font-medium text-gray-700">Click to upload files</span>
                <span className="text-xs text-gray-500 mt-1">
                  Documents, images, zip files, etc.
                </span>
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Files ({files.length})</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading || files.length === 0} 
                className="flex-1"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

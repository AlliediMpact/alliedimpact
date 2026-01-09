'use client';

import { useState } from 'react';
import { X, Download, Trash2, Share2, ZoomIn, ZoomOut, RotateCw, ExternalLink, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Button } from '@allied-impact/ui';

export interface FilePreview {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  uploadedByName?: string;
}

interface FilePreviewModalProps {
  file: FilePreview;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  onDownload?: () => void;
}

export default function FilePreviewModal({ file, onClose, onDelete, onDownload }: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isDocument = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
  ].includes(file.type);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      setDeleting(true);
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(file.url);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getGoogleDocsViewerUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-background border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* File Icon */}
            <div className="flex-shrink-0">
              {isImage && <ImageIcon className="h-5 w-5" />}
              {isPDF && <FileText className="h-5 w-5 text-red-600" />}
              {!isImage && !isPDF && <File className="h-5 w-5" />}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{file.name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • Uploaded by {file.uploadedByName || 'Unknown'} on{' '}
                {file.uploadedAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Image Controls */}
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRotation((rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}

            <div className="h-6 w-px bg-border mx-2" />

            {/* Download */}
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>

            {/* Share */}
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Delete */}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}

            {/* Close */}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
          {/* Image Preview */}
          {isImage && (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={file.url}
                alt={file.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                }}
                className="object-contain"
              />
            </div>
          )}

          {/* PDF Preview */}
          {isPDF && (
            <iframe
              src={`${file.url}#view=FitH`}
              className="w-full h-full border-0"
              title={file.name}
            />
          )}

          {/* Document Preview (Google Docs Viewer) */}
          {isDocument && (
            <div className="w-full h-full flex flex-col">
              <iframe
                src={getGoogleDocsViewerUrl()}
                className="w-full h-full border-0"
                title={file.name}
              />
              <div className="text-center py-4">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download to view in full quality
                </Button>
              </div>
            </div>
          )}

          {/* Unsupported File Type */}
          {!isImage && !isPDF && !isDocument && (
            <div className="text-center py-12">
              <File className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium mb-2">Preview Not Available</h3>
              <p className="text-muted-foreground mb-6">
                This file type cannot be previewed in the browser
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
                <Button variant="outline" onClick={() => window.open(file.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Metadata */}
        <div className="bg-background border-t px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Type: {file.type}</span>
              <span>Size: {formatFileSize(file.size)}</span>
              <span>Uploaded: {file.uploadedAt.toLocaleString()}</span>
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              Open Original
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to determine if file can be previewed
export function canPreviewFile(fileType: string): boolean {
  if (fileType.startsWith('image/')) return true;
  if (fileType === 'application/pdf') return true;
  
  const documentTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
  ];
  
  return documentTypes.includes(fileType);
}

// Helper function to get file icon
export function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType === 'application/pdf') return FileText;
  return File;
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

export type FileType = 'resume' | 'logo' | 'profile-picture';

interface FileUploadProps {
  fileType: FileType;
  currentFileUrl?: string;
  onUpload: (file: File) => Promise<string>; // Returns the uploaded file URL
  onDelete?: () => Promise<void>;
  userTier: 'free' | 'entry' | 'classic';
  maxSizeMB?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
}

export function FileUpload({
  fileType,
  currentFileUrl,
  onUpload,
  onDelete,
  userTier,
  maxSizeMB = 5,
  acceptedFormats,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFileUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File type configurations
  const fileConfig = {
    resume: {
      label: 'Resume',
      icon: FileText,
      accept: acceptedFormats || ['.pdf', '.doc', '.docx'],
      maxSize: maxSizeMB,
      description: 'Upload your resume (PDF or DOCX)',
    },
    logo: {
      label: 'Company Logo',
      icon: ImageIcon,
      accept: acceptedFormats || ['.png', '.jpg', '.jpeg'],
      maxSize: 2,
      description: 'Upload your company logo (PNG or JPG)',
    },
    'profile-picture': {
      label: 'Profile Picture',
      icon: ImageIcon,
      accept: acceptedFormats || ['.png', '.jpg', '.jpeg'],
      maxSize: 2,
      description: 'Upload your profile picture (PNG or JPG)',
    },
  };

  const config = fileConfig[fileType];
  const Icon = config.icon;

  // Check if user can upload (tier gate)
  const canUpload = userTier !== 'free';

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${config.maxSize}MB`;
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!config.accept.includes(fileExtension)) {
      return `Only ${config.accept.join(', ')} files are allowed`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!canUpload || disabled) return;

      setError(null);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Generate preview for images
      if (fileType !== 'resume') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload file
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const uploadedUrl = await onUpload(file);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setPreviewUrl(uploadedUrl);

        // Reset progress after a delay
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload file. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
        setPreviewUrl(currentFileUrl || null);
      }
    },
    [canUpload, disabled, fileType, currentFileUrl, onUpload, config.maxSize, config.accept]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (!canUpload || disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [canUpload, disabled, handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete();
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete file. Please try again.');
      }
    }
  };

  // If user is on free tier, show upgrade CTA
  if (!canUpload) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {config.label} Upload Not Available
        </h3>
        <p className="text-gray-600 mb-4">
          Upgrade to Entry or Classic tier to upload {config.label.toLowerCase()}s
        </p>
        <Button variant="default" onClick={() => (window.location.href = '/pricing')}>
          Upgrade Now
        </Button>
      </div>
    );
  }

  // If file is already uploaded, show preview with delete option
  if (previewUrl && !isUploading) {
    return (
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">{config.label} Uploaded</p>
              <p className="text-sm text-gray-600">File uploaded successfully</p>
            </div>
          </div>
          <Badge variant="success">Uploaded</Badge>
        </div>

        {/* Image preview for logo and profile picture */}
        {fileType !== 'resume' && (
          <div className="mb-4">
            <img
              src={previewUrl}
              alt={config.label}
              className="max-w-xs max-h-48 rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* Resume preview */}
        {fileType === 'resume' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Resume.pdf</p>
              <p className="text-sm text-gray-600">Click to view or download</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Replace File
          </Button>
          {onDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={disabled}>
              <X className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Show upload zone
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            <div>
              <p className="font-semibold text-gray-900 mb-2">Uploading {config.label}...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <>
            <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.description}</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>Accepted: {config.accept.join(', ')}</span>
              <span>•</span>
              <span>Max size: {config.maxSize}MB</span>
            </div>
            <Button variant="outline" className="mt-4" disabled={disabled}>
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

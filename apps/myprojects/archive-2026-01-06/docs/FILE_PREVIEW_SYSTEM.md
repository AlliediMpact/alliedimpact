# File Preview System Documentation

## Overview

The File Preview System allows users to view files directly in the browser without downloading them, supporting images, PDFs, and Office documents with zoom, rotation, and quick actions.

## Supported File Types

### Images
- **Formats**: JPG, PNG, GIF, WebP, SVG
- **Features**: Zoom (50-200%), Rotation (90° increments), Pan

### PDFs
- **Format**: PDF documents
- **Features**: Native browser PDF viewer with scroll, search, print

### Office Documents
- **Formats**: 
  - Word: .docx, .doc
  - Excel: .xlsx, .xls
  - PowerPoint: .pptx, .ppt
- **Features**: Google Docs Viewer embed, download option

### Unsupported Types
- Video, Audio, Archives, Code files
- **Fallback**: Download button and "Open in New Tab" option

## Features

- **Full-Screen Modal**: Immersive preview experience
- **File Metadata**: Name, size, upload date, uploader
- **Quick Actions**: Download, Share link, Delete
- **Image Controls**: Zoom in/out, Rotate, Reset
- **Keyboard Shortcuts**: Escape to close
- **Responsive**: Works on desktop and tablet

## User Interface

### Modal Layout

**Header Bar**:
- File icon (image/PDF/generic)
- File name
- Metadata (size, uploader, date)
- Action buttons (zoom, rotate, download, share, delete, close)

**Preview Area**:
- Images: Zoomable, rotatable display
- PDFs: Embedded iframe viewer
- Documents: Google Docs Viewer iframe
- Unsupported: Download prompt with icon

**Footer Bar**:
- File type
- File size
- Upload timestamp
- "Open Original" link

### Controls

**Image Controls**:
- **Zoom Out** (-25%): Minimum 50%
- **Zoom Display**: Shows current zoom percentage
- **Zoom In** (+25%): Maximum 200%
- **Rotate**: 90° clockwise rotation

**Global Actions**:
- **Download**: Download file to device
- **Share**: Copy file URL to clipboard
- **Delete**: Remove file (with confirmation)
- **Close**: Exit preview (X button or click overlay)

## Developer Guide

### Usage

```typescript
import FilePreviewModal, { FilePreview } from '@/components/FilePreviewModal';

const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);

// File structure
const file: FilePreview = {
  id: '123',
  name: 'design-mockup.png',
  url: 'https://storage.googleapis.com/...',
  type: 'image/png',
  size: 2048576, // bytes
  uploadedBy: 'userId',
  uploadedAt: new Date(),
  uploadedByName: 'John Doe'
};

// Render modal
{selectedFile && (
  <FilePreviewModal
    file={selectedFile}
    onClose={() => setSelectedFile(null)}
    onDelete={async () => {
      await deleteFile(selectedFile.id);
    }}
    onDownload={() => {
      // Custom download logic
    }}
  />
)}
```

### File Preview Interface

```typescript
interface FilePreview {
  id: string;
  name: string;
  url: string; // Direct URL to file
  type: string; // MIME type
  size: number; // Bytes
  uploadedBy: string; // User ID
  uploadedAt: Date;
  uploadedByName?: string; // Display name
}
```

### Helper Functions

```typescript
import { canPreviewFile, getFileIcon } from '@/components/FilePreviewModal';

// Check if file type can be previewed
if (canPreviewFile(file.type)) {
  setSelectedFile(file);
} else {
  // Show download prompt
}

// Get appropriate icon for file type
const Icon = getFileIcon(file.type);
<Icon className="h-5 w-5" />
```

### Integration with Deliverables

```typescript
// In DeliverableCard component
import FilePreviewModal, { FilePreview } from '@/components/FilePreviewModal';

const [previewFile, setPreviewFile] = useState<FilePreview | null>(null);

// Convert Firebase Storage reference to FilePreview
const handleFileClick = async (fileRef: string) => {
  const file = await getFileMetadata(fileRef);
  setPreviewFile({
    id: file.id,
    name: file.name,
    url: file.downloadURL,
    type: file.contentType,
    size: file.size,
    uploadedBy: deliverable.uploadedBy,
    uploadedAt: deliverable.uploadedAt,
    uploadedByName: deliverable.uploadedByName
  });
};

// Render file list with preview
{deliverable.files.map(file => (
  <button onClick={() => handleFileClick(file)}>
    {file.name}
  </button>
))}

{previewFile && (
  <FilePreviewModal
    file={previewFile}
    onClose={() => setPreviewFile(null)}
    onDelete={async () => {
      await deleteDeliverableFile(deliverable.id, previewFile.id);
    }}
  />
)}
```

## Image Preview Features

### Zoom Control

- **Range**: 50% to 200%
- **Increment**: 25% per click
- **Default**: 100%
- **Smooth**: CSS transition animation
- **Keyboard**: +/- keys (future enhancement)

### Rotation

- **Angle**: 90° increments (0°, 90°, 180°, 270°)
- **Direction**: Clockwise
- **Combined**: Works with zoom
- **Reset**: Close and reopen modal

### Pan (Future)

- Currently auto-centers
- Future: Click and drag to pan
- Future: Scroll to pan

## PDF Preview

Uses browser's native PDF viewer:

```typescript
<iframe
  src={`${file.url}#view=FitH`}
  className="w-full h-full border-0"
  title={file.name}
/>
```

**URL Parameters**:
- `#view=FitH`: Fit to width
- `#page=2`: Jump to page 2
- `#zoom=150`: Set zoom level

## Document Preview

Uses Google Docs Viewer for Office documents:

```typescript
const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

<iframe src={viewerUrl} className="w-full h-full" />
```

**Limitations**:
- Requires public URL (Firebase Storage works)
- May have quality reduction
- Some formatting may differ
- No editing capability

**Alternative**: Microsoft Office Online Viewer

## File Actions

### Download

```typescript
const handleDownload = () => {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  link.click();
};
```

Or custom logic via `onDownload` prop.

### Share Link

```typescript
const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(file.url);
    alert('Link copied to clipboard!');
  } catch (error) {
    // Fallback: Show URL in modal
  }
};
```

### Delete

```typescript
const handleDelete = async () => {
  if (!confirm(`Delete "${file.name}"?`)) return;
  
  await onDelete(); // Custom delete logic
  onClose();
};
```

**Delete Flow**:
1. Confirmation dialog
2. Call `onDelete` prop (passed from parent)
3. Delete from Firebase Storage
4. Delete from Firestore document
5. Close modal

## Security Considerations

### Firebase Storage Rules

```javascript
match /projects/{projectId}/deliverables/{deliverableId}/{allPaths=**} {
  // Allow read for project team members
  allow read: if request.auth != null && 
    isProjectMember(projectId, request.auth.uid);
  
  // Allow write for uploaders
  allow write: if request.auth != null && 
    isProjectMember(projectId, request.auth.uid);
  
  // Allow delete for uploader or admin
  allow delete: if request.auth != null && 
    (resource.metadata.uploadedBy == request.auth.uid || 
     hasAdminPermission(projectId, request.auth.uid));
}
```

### URL Security

- Use Firebase Storage signed URLs for private files
- Set expiration times for temporary access
- Validate file types before preview
- Sanitize file names

## Performance Optimization

### Large Files

```typescript
// Show loading state for large files
const [loading, setLoading] = useState(true);

<img 
  src={file.url} 
  onLoad={() => setLoading(false)}
  style={{ display: loading ? 'none' : 'block' }}
/>

{loading && <Spinner />}
```

### Lazy Loading

```typescript
// Only load preview when modal opens
{showPreview && <FilePreviewModal ... />}
```

### Caching

Browser automatically caches downloaded files. For better control:

```typescript
// Add cache headers in Storage rules
metadata: {
  cacheControl: 'public, max-age=3600'
}
```

## Keyboard Shortcuts

### Implemented

- **Escape**: Close preview

### Future Enhancements

- **Arrow Keys**: Navigate between files
- **+/-**: Zoom in/out
- **R**: Rotate
- **D**: Download
- **Delete**: Delete file
- **Space**: Toggle fullscreen

## Mobile Considerations

### Responsive Design

- Full-screen modal on mobile
- Touch-friendly button sizes (min 44x44px)
- Pinch-to-zoom for images (future)
- Swipe to close (future)

### Mobile-Specific Features

```typescript
// Detect mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Adjust controls
{!isMobile && <ZoomControls />}

// Use native sharing
if (navigator.share) {
  await navigator.share({
    title: file.name,
    url: file.url
  });
}
```

## Accessibility

- **Alt Text**: Image file names as alt text
- **ARIA Labels**: Button labels for screen readers
- **Keyboard Navigation**: Tab through controls
- **Focus Management**: Auto-focus close button on open
- **Color Contrast**: WCAG AA compliant

## Future Enhancements

- [ ] Video preview player
- [ ] Audio preview player
- [ ] Code syntax highlighting preview
- [ ] Archive (ZIP) file browser
- [ ] 3D model viewer (STL, OBJ)
- [ ] Gallery mode (navigate between files)
- [ ] Annotations and markup tools
- [ ] Version comparison (side-by-side)
- [ ] Thumbnail generation
- [ ] Search within PDF
- [ ] Download progress indicator
- [ ] Fullscreen mode
- [ ] Print directly from preview

## Testing

### Manual Testing

1. **Image Preview**
   - Upload image file
   - Click to preview
   - Test zoom in/out
   - Test rotation
   - Download image
   - Delete image

2. **PDF Preview**
   - Upload PDF
   - Verify PDF renders
   - Scroll through pages
   - Test download

3. **Document Preview**
   - Upload Word/Excel/PowerPoint
   - Verify Google Docs Viewer loads
   - Check formatting preserved
   - Test download

4. **Unsupported Files**
   - Upload .zip or .exe
   - Verify "Preview Not Available"
   - Test download button
   - Test "Open in New Tab"

### Automated Testing

```typescript
describe('FilePreviewModal', () => {
  it('should display image with zoom controls', () => {
    render(<FilePreviewModal file={imageFile} onClose={jest.fn()} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom In')).toBeInTheDocument();
  });

  it('should handle file download', async () => {
    const onDownload = jest.fn();
    render(<FilePreviewModal file={imageFile} onClose={jest.fn()} onDownload={onDownload} />);
    
    fireEvent.click(screen.getByLabelText('Download'));
    expect(onDownload).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Image Not Loading
- Check Firebase Storage URL is valid
- Verify Storage rules allow read access
- Check CORS settings
- Inspect network tab for errors

### PDF Not Rendering
- Some PDFs may be too large
- Check browser PDF viewer enabled
- Try "Open Original" link
- Consider PDF.js library for better support

### Google Docs Viewer Fails
- Ensure file URL is publicly accessible
- Check file size (limit: 25 MB)
- Verify MIME type is correct
- Use direct download as fallback

### Zoom/Rotation Not Working
- Check CSS transform support
- Verify state updates correctly
- Inspect browser console for errors

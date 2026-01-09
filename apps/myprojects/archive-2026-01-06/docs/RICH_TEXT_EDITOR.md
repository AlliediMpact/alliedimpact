# Rich Text Editor Documentation

## Overview

The Rich Text Editor provides a WYSIWYG editing experience for descriptions, comments, and long-form content across the application. Built with TipTap, it supports formatting, links, images, code blocks, and markdown.

## Features

- **WYSIWYG Editing**: What You See Is What You Get
- **Formatting Toolbar**: Bold, italic, strikethrough, inline code
- **Headings**: H1, H2 support
- **Lists**: Bullet lists and numbered lists
- **Quotes**: Blockquote formatting
- **Links**: Add hyperlinks with URL prompt
- **Images**: Embed images with URL
- **Code Blocks**: Syntax-highlighted code blocks
- **Undo/Redo**: Full history support
- **Preview Mode**: Toggle between edit and preview
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, Ctrl+I, etc.)
- **Read-Only Viewer**: Display formatted content without editing

## Tech Stack

- **TipTap**: Headless editor framework
- **Starter Kit**: Core editing extensions
- **Lowlight**: Syntax highlighting for code blocks
- **Lucide Icons**: Toolbar icons

## Usage

### Basic Editor

```typescript
import RichTextEditor from '@/components/RichTextEditor';

const [description, setDescription] = useState('<p>Initial content</p>');

<RichTextEditor
  content={description}
  onChange={setDescription}
  placeholder="Enter description..."
/>
```

### Props

```typescript
interface RichTextEditorProps {
  content: string;              // HTML content
  onChange: (content: string) => void;  // Called on content change
  placeholder?: string;         // Placeholder text
  editable?: boolean;          // Enable/disable editing (default: true)
  minHeight?: string;          // Minimum editor height (default: '200px')
  showToolbar?: boolean;       // Show/hide toolbar (default: true)
}
```

### Read-Only Viewer

```typescript
import { RichTextViewer } from '@/components/RichTextEditor';

<RichTextViewer 
  content={milestone.description} 
  className="p-4"
/>
```

### Example: Milestone Description

```typescript
'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@allied-impact/ui';

export default function MilestoneForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createMilestone({
      name,
      description, // Stored as HTML
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Milestone name"
      />
      
      <RichTextEditor
        content={description}
        onChange={setDescription}
        placeholder="Describe this milestone..."
        minHeight="300px"
      />
      
      <Button type="submit">Create Milestone</Button>
    </form>
  );
}
```

## Toolbar Buttons

### Text Formatting

| Button | Shortcut | Function |
|--------|----------|----------|
| **B** | Ctrl+B | Bold text |
| *I* | Ctrl+I | Italic text |
| ~~S~~ | - | Strikethrough |
| `</>` | - | Inline code |

### Structure

| Button | Shortcut | Function |
|--------|----------|----------|
| H1 | - | Heading 1 |
| H2 | - | Heading 2 |
| • | - | Bullet list |
| 1. | - | Numbered list |
| " | - | Blockquote |

### Insert

| Button | Function |
|--------|----------|
| 🔗 | Add hyperlink |
| 🖼️ | Insert image |

### History

| Button | Shortcut | Function |
|--------|----------|----------|
| ↶ | Ctrl+Z | Undo |
| ↷ | Ctrl+Y | Redo |

### View

| Button | Function |
|--------|----------|
| 👁️ | Toggle preview mode |

## Keyboard Shortcuts

### Text Formatting

- **Bold**: `Ctrl + B` or `Cmd + B`
- **Italic**: `Ctrl + I` or `Cmd + I`
- **Inline Code**: `Ctrl + E` or `Cmd + E`

### Structure

- **Heading 1**: `Ctrl + Alt + 1`
- **Heading 2**: `Ctrl + Alt + 2`
- **Bullet List**: `Ctrl + Shift + 8`
- **Numbered List**: `Ctrl + Shift + 7`
- **Blockquote**: `Ctrl + Shift + B`

### History

- **Undo**: `Ctrl + Z` or `Cmd + Z`
- **Redo**: `Ctrl + Y` or `Cmd + Shift + Z`

### Other

- **Create Link**: Select text, press `Ctrl + K`
- **Hard Break**: `Shift + Enter`
- **Clear Formatting**: `Ctrl + \`

## Styling

The editor uses Tailwind's `prose` classes for consistent typography:

```css
.prose {
  /* Headings */
  h1, h2, h3 { font-weight: 700; margin-top: 2em; }
  
  /* Paragraphs */
  p { margin-top: 1.25em; margin-bottom: 1.25em; }
  
  /* Lists */
  ul, ol { padding-left: 1.5em; }
  
  /* Links */
  a { color: var(--primary); text-decoration: underline; }
  
  /* Code */
  code { background: var(--muted); padding: 0.2em 0.4em; border-radius: 0.25rem; }
  
  /* Blockquotes */
  blockquote { border-left: 4px solid var(--border); padding-left: 1em; }
}
```

### Custom Styling

Override with className:

```typescript
<RichTextViewer 
  content={content} 
  className="prose-lg prose-blue" 
/>
```

## Integration Examples

### Milestone Manager

```typescript
// Add to MilestoneModal
import RichTextEditor from '@/components/RichTextEditor';

<div>
  <label className="block text-sm font-medium mb-2">
    Description
  </label>
  <RichTextEditor
    content={description}
    onChange={setDescription}
    placeholder="Describe the milestone objectives, deliverables, and success criteria..."
    minHeight="250px"
  />
</div>

// Display in MilestoneCard
import { RichTextViewer } from '@/components/RichTextEditor';

<RichTextViewer content={milestone.description} />
```

### Deliverable Manager

```typescript
// Add to DeliverableModal
<RichTextEditor
  content={notes}
  onChange={setNotes}
  placeholder="Add notes about this deliverable..."
  minHeight="200px"
/>
```

### Ticket System

```typescript
// Ticket description
<RichTextEditor
  content={ticketDescription}
  onChange={setTicketDescription}
  placeholder="Describe the issue in detail..."
  minHeight="300px"
/>

// Ticket comments
<RichTextEditor
  content={comment}
  onChange={setComment}
  placeholder="Add a comment..."
  minHeight="150px"
  showToolbar={true}
/>
```

### Project Overview

```typescript
// Project description in settings
<RichTextEditor
  content={project.overview}
  onChange={(html) => updateProject({ overview: html })}
  placeholder="Provide an overview of the project..."
  minHeight="400px"
/>
```

## Helper Functions

### Markdown to HTML Migration

Convert existing markdown content to HTML:

```typescript
import { markdownToHtml } from '@/components/RichTextEditor';

// Migrate old markdown descriptions
const html = markdownToHtml(milestone.descriptionMarkdown);
await updateMilestone(milestone.id, { description: html });
```

### HTML to Plain Text

Extract plain text for search/preview:

```typescript
import { htmlToPlainText } from '@/components/RichTextEditor';

const excerpt = htmlToPlainText(milestone.description).substring(0, 100);
// "This milestone focuses on implementing the authentication system..."
```

### Content Validation

Check if content is empty:

```typescript
function isContentEmpty(html: string): boolean {
  const text = htmlToPlainText(html);
  return text.length === 0;
}

// In form validation
if (isContentEmpty(description)) {
  setError('Description is required');
  return;
}
```

## Data Storage

### Firestore

Store HTML content directly:

```typescript
await addDoc(collection(db, 'milestones'), {
  name: 'MVP Launch',
  description: '<h2>Overview</h2><p>This milestone...</p>',
  createdAt: serverTimestamp(),
});
```

### Content Length

HTML content is larger than plain text. Consider:

- **Firestore limit**: 1 MB per document
- **Typical rich text**: 5-10 KB for moderate content
- **With images**: Can be larger if base64 encoded

### Best Practices

1. **Store as HTML**: No conversion needed for display
2. **Index plain text**: Extract for full-text search
3. **Validate length**: Warn if content exceeds reasonable size
4. **Sanitize input**: TipTap handles this automatically

```typescript
interface Milestone {
  id: string;
  name: string;
  description: string; // HTML
  descriptionPlainText: string; // For search
  descriptionLength: number; // Character count
}

// Before saving
const plainText = htmlToPlainText(description);
await addDoc(collection(db, 'milestones'), {
  description,
  descriptionPlainText: plainText,
  descriptionLength: plainText.length,
});
```

## Extensions & Customization

### Adding Custom Extensions

```typescript
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';

const editor = useEditor({
  extensions: [
    StarterKit,
    TextStyle,
    Color,
    // ... other extensions
  ],
});

// Add color picker to toolbar
<ToolbarButton
  onClick={() => {
    const color = prompt('Enter color:');
    if (color) editor.chain().focus().setColor(color).run();
  }}
  icon={Palette}
  title="Text Color"
/>
```

### Available Extensions

- **Text Style**: Font family, size, color
- **Highlight**: Text background color
- **Text Align**: Left, center, right, justify
- **Task List**: Checkbox lists
- **Table**: Insert tables
- **Mention**: @mention support
- **Collaboration**: Real-time collaborative editing
- **Placeholder**: Custom placeholder per node

### Custom Extension Example

```typescript
import { Extension } from '@tiptap/core';

const CustomKeyboardShortcuts = Extension.create({
  name: 'customKeyboardShortcuts',
  
  addKeyboardShortcuts() {
    return {
      'Mod-s': () => {
        // Save on Ctrl+S
        this.editor.emit('save');
        return true;
      },
    };
  },
});
```

## Accessibility

### Keyboard Navigation

- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous element
- **Arrow Keys**: Navigate text
- **All toolbar buttons**: Keyboard accessible

### Screen Readers

- Toolbar buttons have `title` attributes
- Editor has `role="textbox"` 
- Content is semantic HTML

### Best Practices

1. Provide clear labels for form fields
2. Use semantic headings (H1, H2)
3. Add alt text to images
4. Ensure sufficient color contrast

## Performance

### Large Documents

For documents > 10,000 words:

```typescript
// Lazy load editor
const [showEditor, setShowEditor] = useState(false);

{showEditor ? (
  <RichTextEditor content={content} onChange={onChange} />
) : (
  <button onClick={() => setShowEditor(true)}>
    Edit Description
  </button>
)}
```

### Debounce onChange

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedOnChange = useMemo(
  () => debounce((html: string) => {
    // Save to database
    updateMilestone(id, { description: html });
  }, 1000),
  [id]
);

<RichTextEditor content={content} onChange={debouncedOnChange} />
```

## Testing

### Unit Tests

```typescript
import { render, fireEvent } from '@testing-library/react';
import RichTextEditor from '@/components/RichTextEditor';

describe('RichTextEditor', () => {
  it('should render with initial content', () => {
    const { container } = render(
      <RichTextEditor 
        content="<p>Test</p>" 
        onChange={jest.fn()} 
      />
    );
    expect(container).toHaveTextContent('Test');
  });

  it('should call onChange when content changes', () => {
    const onChange = jest.fn();
    const { container } = render(
      <RichTextEditor content="" onChange={onChange} />
    );
    
    // Simulate typing
    const editor = container.querySelector('[contenteditable]');
    fireEvent.input(editor!, { target: { innerHTML: '<p>New text</p>' } });
    
    expect(onChange).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Milestone Creation with Rich Text', () => {
  it('should create milestone with formatted description', async () => {
    const { getByPlaceholderText, getByText } = render(<MilestoneModal />);
    
    // Type name
    fireEvent.change(getByPlaceholderText('Milestone name'), {
      target: { value: 'Test Milestone' },
    });
    
    // Add description (would need to interact with TipTap editor)
    // ... editor interactions
    
    // Submit
    fireEvent.click(getByText('Create'));
    
    await waitFor(() => {
      expect(mockCreateMilestone).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Milestone',
          description: expect.stringContaining('<p>'),
        })
      );
    });
  });
});
```

## Troubleshooting

### Editor Not Rendering
- Check TipTap packages installed
- Verify editor hook returns non-null
- Check console for errors

### Toolbar Not Working
- Ensure `editable={true}`
- Check `showToolbar={true}`
- Verify button onClick handlers

### Content Not Saving
- Check onChange is called
- Verify HTML is valid
- Inspect Firestore write permissions

### Styling Issues
- Add Tailwind Typography plugin
- Check prose classes applied
- Verify CSS not overriding styles

## Future Enhancements

- [ ] Collaborative editing (multiple users)
- [ ] @mention integration with team members
- [ ] File uploads (drag & drop images)
- [ ] Table support
- [ ] Task lists with checkboxes
- [ ] Emoji picker
- [ ] Text color and highlight
- [ ] Find and replace
- [ ] Word count display
- [ ] Auto-save indicator
- [ ] Markdown import/export
- [ ] Templates/snippets
- [ ] Spelling and grammar check

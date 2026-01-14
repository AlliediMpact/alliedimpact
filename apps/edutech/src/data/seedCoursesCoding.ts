import { Course } from '@/types';

/**
 * Seed Data: Coding Track Courses
 * 
 * Production-ready coding courses with structured lessons.
 */

export const codingCourses: Omit<Course, 'courseId' | 'createdAt' | 'updatedAt' | 'publishedAt'>[] = [
  {
    title: 'HTML & CSS Fundamentals',
    description: 'Build your first website from scratch! Learn HTML for structure and CSS for styling. By the end, you will create a complete responsive website.',
    shortDescription: 'Build beautiful websites with HTML & CSS',
    track: 'coding',
    category: 'Web Development',
    level: 'beginner',
    tags: ['html', 'css', 'web development', 'frontend', 'responsive design'],
    tier: 'PREMIUM',
    modules: [
      {
        moduleId: 'module-1',
        title: 'Introduction to HTML',
        description: 'Learn the structure of web pages',
        order: 1,
        durationMinutes: 180,
        lessons: [
          {
            lessonId: 'lesson-1-1',
            title: 'What is HTML?',
            type: 'reading',
            content: `# Introduction to HTML

## What is HTML?
HTML (HyperText Markup Language) is the standard language for creating web pages. It provides the structure and content of websites.

## How Websites Work
1. **HTML**: Structure and content (like a house's frame)
2. **CSS**: Styling and layout (like paint and decoration)
3. **JavaScript**: Interactivity (like electricity and plumbing)

## Basic HTML Structure
\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>This is my first web page.</p>
  </body>
</html>
\`\`\`

## Key Concepts
- **Tags**: HTML code wrapped in < >
- **Elements**: Opening tag + content + closing tag
- **Attributes**: Extra information in tags

## Common HTML Tags
- \`<h1>\` to \`<h6>\`: Headings (h1 largest, h6 smallest)
- \`<p>\`: Paragraph
- \`<a>\`: Link
- \`<img>\`: Image
- \`<div>\`: Container
- \`<ul>\`, \`<li>\`: Lists

## Practice Exercise
Create a simple HTML file:
1. Open text editor (Notepad on Windows)
2. Type the basic HTML structure above
3. Save as "index.html"
4. Double-click file to open in browser
5. You should see "Hello World!" heading`,
            durationMinutes: 30,
            order: 1,
          },
          {
            lessonId: 'lesson-1-2',
            title: 'HTML Text Elements',
            type: 'reading',
            content: `# Working with Text in HTML

## Headings
Six levels of headings for organizing content:
\`\`\`html
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
<h4>Minor Heading</h4>
<h5>Small Heading</h5>
<h6>Smallest Heading</h6>
\`\`\`

**Best Practice**: Only one \`<h1>\` per page for SEO.

## Paragraphs
\`\`\`html
<p>This is a paragraph. It can contain multiple sentences and will wrap automatically based on browser width.</p>
\`\`\`

## Line Breaks
\`\`\`html
<p>First line<br>Second line</p>
\`\`\`

## Text Formatting
- **Bold**: \`<strong>Important text</strong>\` or \`<b>Bold text</b>\`
- **Italic**: \`<em>Emphasized text</em>\` or \`<i>Italic text</i>\`
- **Underline**: \`<u>Underlined text</u>\`
- **Strikethrough**: \`<del>Deleted text</del>\`

## Links
\`\`\`html
<a href="https://www.google.com">Go to Google</a>
<a href="about.html">About Page</a>
<a href="mailto:info@example.com">Email Us</a>
\`\`\`

## Lists
### Unordered (Bullet Points)
\`\`\`html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
\`\`\`

### Ordered (Numbered)
\`\`\`html
<ol>
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>
\`\`\`

## Practice Exercise
Create an "About Me" page with:
- Your name as h1
- 2-3 paragraphs about yourself
- A list of your hobbies (use ul/li)
- A link to your favorite website
- Use bold and italic for emphasis`,
            durationMinutes: 40,
            order: 2,
          },
          {
            lessonId: 'lesson-1-3',
            title: 'Images and Media',
            type: 'reading',
            content: `# Adding Images and Media

## Images
\`\`\`html
<img src="photo.jpg" alt="Description of image">
\`\`\`

### Image Attributes
- **src**: File path or URL
- **alt**: Text description (for accessibility and SEO)
- **width**: Width in pixels
- **height**: Height in pixels

### Example
\`\`\`html
<img src="images/profile.jpg" alt="My profile photo" width="300" height="300">
\`\`\`

## Image Sources
- Local file: \`src="images/photo.jpg"\`
- External URL: \`src="https://example.com/photo.jpg"\`

## Free Image Resources
- Unsplash.com
- Pexels.com
- Pixabay.com

## Best Practices
- Use descriptive file names: \`profile-photo.jpg\` not \`img001.jpg\`
- Optimize image size (compress before uploading)
- Always include alt text for accessibility
- Use appropriate formats:
  - **JPEG**: Photos
  - **PNG**: Graphics with transparency
  - **SVG**: Logos and icons

## Video (Embedded)
\`\`\`html
<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" allowfullscreen>
</iframe>
\`\`\`

## Audio
\`\`\`html
<audio controls>
  <source src="song.mp3" type="audio/mpeg">
  Your browser does not support audio.
</audio>
\`\`\`

## Practice Exercise
Enhance your About Me page:
1. Add a profile photo
2. Add images of your hobbies
3. Embed a YouTube video you like
4. Make sure all images have alt text`,
            durationMinutes: 35,
            order: 3,
          },
        ],
      },
      {
        moduleId: 'module-2',
        title: 'Introduction to CSS',
        description: 'Style your web pages with colors, fonts, and layouts',
        order: 2,
        durationMinutes: 200,
        lessons: [
          {
            lessonId: 'lesson-2-1',
            title: 'What is CSS?',
            type: 'reading',
            content: `# Getting Started with CSS

## What is CSS?
CSS (Cascading Style Sheets) controls how HTML elements look:
- Colors
- Fonts
- Spacing
- Layout
- Animations

## Three Ways to Add CSS

### 1. Inline CSS (Not Recommended)
\`\`\`html
<p style="color: blue; font-size: 20px;">Blue text</p>
\`\`\`

### 2. Internal CSS
\`\`\`html
<head>
  <style>
    p {
      color: blue;
      font-size: 20px;
    }
  </style>
</head>
\`\`\`

### 3. External CSS (Best Practice)
HTML file:
\`\`\`html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

CSS file (styles.css):
\`\`\`css
p {
  color: blue;
  font-size: 20px;
}
\`\`\`

## CSS Syntax
\`\`\`css
selector {
  property: value;
  property: value;
}
\`\`\`

## Common Selectors
\`\`\`css
/* Element selector */
p { color: red; }

/* Class selector */
.intro { font-size: 18px; }

/* ID selector */
#header { background: blue; }

/* Multiple selectors */
h1, h2, h3 { color: navy; }
\`\`\`

## Colors in CSS
\`\`\`css
/* Color names */
color: red;

/* Hex codes */
color: #FF0000;

/* RGB */
color: rgb(255, 0, 0);

/* RGBA (with transparency) */
color: rgba(255, 0, 0, 0.5);
\`\`\`

## Practice Exercise
1. Create a styles.css file
2. Link it to your HTML
3. Style your headings with different colors
4. Change paragraph font size
5. Add a background color to body`,
            durationMinutes: 40,
            order: 1,
          },
        ],
      },
    ],
    createdBy: 'platform',
    estimatedHours: 20,
    thumbnailUrl: '/images/courses/html-css.jpg',
    published: true,
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
  },

  {
    title: 'JavaScript for Beginners',
    description: 'Learn to code with JavaScript! Start with basics and build interactive websites. Master variables, functions, loops, and DOM manipulation.',
    shortDescription: 'Learn programming with JavaScript',
    track: 'coding',
    category: 'Programming',
    level: 'beginner',
    tags: ['javascript', 'programming', 'web development', 'coding', 'interactive'],
    tier: 'PREMIUM',
    modules: [
      {
        moduleId: 'module-1',
        title: 'JavaScript Basics',
        description: 'Learn variables, data types, and basic operations',
        order: 1,
        durationMinutes: 200,
        lessons: [
          {
            lessonId: 'lesson-1-1',
            title: 'Introduction to JavaScript',
            type: 'reading',
            content: `# Welcome to JavaScript!

## What is JavaScript?
JavaScript is a programming language that makes websites interactive:
- Respond to button clicks
- Validate forms
- Create animations
- Update content without reloading page
- Build games and apps

## JavaScript vs Java
They are completely different! JavaScript runs in web browsers, Java is a different language.

## Where Does JavaScript Run?
- **Browser**: Chrome, Firefox, Safari (frontend)
- **Server**: Node.js (backend)
- **Mobile Apps**: React Native
- **Desktop Apps**: Electron

## Adding JavaScript to HTML

### Method 1: Internal Script
\`\`\`html
<body>
  <script>
    console.log("Hello, World!");
  </script>
</body>
\`\`\`

### Method 2: External File (Best Practice)
HTML:
\`\`\`html
<body>
  <script src="script.js"></script>
</body>
\`\`\`

JavaScript file (script.js):
\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## Your First JavaScript Program
\`\`\`javascript
// This is a comment
console.log("Hello, World!"); // Print to console
alert("Welcome to JavaScript!"); // Show popup
\`\`\`

## Developer Console
Open browser console to see JavaScript output:
- **Chrome**: F12 or Ctrl+Shift+J
- **Firefox**: F12 or Ctrl+Shift+K
- **Safari**: Cmd+Option+C (Mac)

## Variables
Variables store data:
\`\`\`javascript
let name = "John";
let age = 25;
let isStudent = true;

console.log(name); // John
console.log(age); // 25
\`\`\`

### Variable Keywords
- **let**: Can be changed
- **const**: Cannot be changed
- **var**: Old way (avoid)

## Data Types
\`\`\`javascript
// String (text)
let name = "Alice";

// Number
let age = 30;
let price = 19.99;

// Boolean (true/false)
let isActive = true;

// Array (list)
let colors = ["red", "green", "blue"];

// Object
let person = {
  name: "Bob",
  age: 25
};
\`\`\`

## Practice Exercise
1. Create script.js file
2. Link it to your HTML
3. Create variables for your name, age, and city
4. Use console.log() to display them
5. Open browser console to see output`,
            durationMinutes: 45,
            order: 1,
          },
        ],
      },
    ],
    createdBy: 'platform',
    estimatedHours: 25,
    thumbnailUrl: '/images/courses/javascript.jpg',
    published: true,
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
  },
];

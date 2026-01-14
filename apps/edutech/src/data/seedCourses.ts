import { Course, CourseModule, CourseLesson } from '@/types';

/**
 * Seed Data: Computer Skills Track Courses
 * 
 * These are production-ready courses with real lesson content.
 * Use this data to populate Firestore on first deploy.
 */

export const computerSkillsCourses: Omit<Course, 'courseId' | 'createdAt' | 'updatedAt' | 'publishedAt'>[] = [
  {
    title: 'Digital Literacy Fundamentals',
    description: 'Learn the essential computer skills needed for everyday life and work. This comprehensive course covers computer basics, internet usage, online safety, and digital communication.',
    shortDescription: 'Master essential computer skills for modern life',
    track: 'computer-skills',
    category: 'Digital Literacy',
    level: 'beginner',
    tags: ['computer basics', 'internet', 'email', 'safety', 'beginner'],
    tier: 'FREE',
    modules: [
      {
        moduleId: 'module-1',
        title: 'Introduction to Computers',
        description: 'Understanding computer hardware, software, and operating systems',
        order: 1,
        durationMinutes: 120,
        lessons: [
          {
            lessonId: 'lesson-1-1',
            title: 'What is a Computer?',
            type: 'reading',
            content: `# What is a Computer?

A computer is an electronic device that processes data and performs tasks according to a set of instructions called programs.

## Key Components

### Hardware
- **CPU (Central Processing Unit)**: The brain of the computer
- **RAM (Random Access Memory)**: Short-term memory for running programs
- **Storage**: Hard drive or SSD for saving files
- **Input Devices**: Keyboard, mouse, touchscreen
- **Output Devices**: Monitor, speakers, printer

### Software
- **Operating System**: Windows, macOS, Linux - manages all computer operations
- **Applications**: Programs like web browsers, word processors, games

## Types of Computers
1. **Desktop Computers**: Stationary, powerful, used at home or office
2. **Laptops**: Portable computers with built-in screen and keyboard
3. **Tablets**: Touchscreen devices, lightweight and portable
4. **Smartphones**: Pocket-sized computers with phone capabilities

## Why Learn Computer Skills?
- Essential for most modern jobs
- Access to information and education
- Communication with friends and family
- Online banking and shopping
- Entertainment and creativity`,
            durationMinutes: 20,
            order: 1,
          },
          {
            lessonId: 'lesson-1-2',
            title: 'Turning On and Using Your Computer',
            type: 'reading',
            content: `# Starting Your Computer Journey

## Turning On Your Computer

### Desktop Computer
1. Ensure power cable is connected
2. Press the power button (usually on the front of the tower)
3. Monitor should turn on automatically
4. Wait for the operating system to load (30-60 seconds)

### Laptop
1. Open the laptop lid
2. Press the power button (usually above keyboard or on side)
3. Wait for startup

## First Login
- You may need to enter a password
- If it's a new computer, follow the setup wizard
- Create a strong password you can remember

## The Desktop
Your desktop is the main screen you see after logging in:
- **Icons**: Small pictures representing programs and files
- **Taskbar**: Bar at bottom (Windows) or top (Mac) showing open programs
- **Start Menu**: Click the Windows icon (bottom-left) to find programs

## Using the Mouse
- **Left Click**: Select items, open programs (click once or twice)
- **Right Click**: Show options menu
- **Scroll Wheel**: Move up and down on pages
- **Drag**: Hold left button and move to relocate items

## Using the Keyboard
- **Enter**: Confirm actions, start new line
- **Backspace**: Delete text before cursor
- **Delete**: Remove text after cursor
- **Ctrl+C**: Copy
- **Ctrl+V**: Paste
- **Ctrl+Z**: Undo

## Practice Exercise
1. Turn on your computer
2. Log in with your password
3. Find and open the "Calculator" program
4. Perform a simple calculation
5. Close the calculator`,
            durationMinutes: 25,
            order: 2,
          },
          {
            lessonId: 'lesson-1-3',
            title: 'Understanding Files and Folders',
            type: 'reading',
            content: `# Managing Files and Folders

## What are Files?
Files are containers for your data:
- **Documents**: Word files, PDFs, text files
- **Images**: Photos, pictures, graphics
- **Videos**: Movies, recordings
- **Audio**: Music, podcasts, recordings
- **Programs**: Software applications

## What are Folders?
Folders organize your files, like drawers in a filing cabinet.

## File Explorer (Windows) / Finder (Mac)
This program helps you browse your files:
- **This PC / Computer**: Shows all drives and main folders
- **Documents**: Default location for files
- **Pictures**: For photos and images
- **Downloads**: Files from internet go here
- **Desktop**: Files shown on your desktop screen

## Creating a New Folder
1. Open File Explorer
2. Navigate where you want the folder
3. Right-click empty space
4. Select "New" → "Folder"
5. Type a name and press Enter

## Organizing Files
**Best Practices:**
- Use descriptive names (not "Document1", use "Budget_2026")
- Create folders by category (Work, Personal, Photos)
- Keep Desktop clean (move files to proper folders)
- Delete files you no longer need

## Moving Files
**Method 1: Drag and Drop**
- Click and hold file
- Drag to destination folder
- Release mouse button

**Method 2: Cut and Paste**
- Right-click file → Cut
- Navigate to destination
- Right-click → Paste

## Copying vs Moving
- **Copy**: Creates duplicate, original stays
- **Move**: Relocates file, original location empty

## File Extensions
Files have extensions showing their type:
- .docx = Word document
- .pdf = PDF document
- .jpg = Image
- .mp4 = Video
- .zip = Compressed folder

## Practice Exercise
1. Create a folder on your Desktop called "My Practice"
2. Create three subfolders: "Documents", "Images", "Other"
3. Download an image from the internet
4. Move it to your "Images" folder
5. Rename the image to "Practice Image"`,
            durationMinutes: 30,
            order: 3,
          },
        ],
      },
      {
        moduleId: 'module-2',
        title: 'Internet and Web Browsing',
        description: 'Learn to navigate the internet safely and effectively',
        order: 2,
        durationMinutes: 150,
        lessons: [
          {
            lessonId: 'lesson-2-1',
            title: 'Introduction to the Internet',
            type: 'reading',
            content: `# Understanding the Internet

## What is the Internet?
The Internet is a global network connecting millions of computers worldwide, allowing them to share information.

## How Does It Work?
- Computers connect through cables, satellites, and wireless signals
- Information travels in small packets
- Special computers called "servers" store websites and data
- Your computer (client) requests information from servers

## What Can You Do Online?
1. **Search for Information**: Google, Wikipedia
2. **Communication**: Email, video calls, social media
3. **Shopping**: Online stores, banking
4. **Entertainment**: Videos, music, games
5. **Learning**: Online courses, tutorials
6. **Work**: Remote jobs, collaboration tools

## Key Terms
- **Website**: Collection of web pages (like www.google.com)
- **Web Browser**: Program to view websites (Chrome, Firefox, Safari)
- **URL**: Website address (www.example.com)
- **Search Engine**: Tool to find websites (Google, Bing)
- **Download**: Copy files from internet to your computer
- **Upload**: Send files from your computer to internet

## Internet Connection Types
- **Wi-Fi**: Wireless internet (requires password)
- **Mobile Data**: Internet through cell phone network
- **Cable/Fiber**: Wired connection to your home

## South African Context
- Data can be expensive - monitor your usage
- Many places offer free Wi-Fi (libraries, cafes, malls)
- Consider data-saving browser modes
- MTN, Vodacom, Cell C, Telkom provide internet services`,
            durationMinutes: 25,
            order: 1,
          },
          {
            lessonId: 'lesson-2-2',
            title: 'Using a Web Browser',
            type: 'reading',
            content: `# Web Browser Basics

## Popular Web Browsers
- **Google Chrome**: Fast, popular, integrates with Google services
- **Mozilla Firefox**: Privacy-focused, customizable
- **Microsoft Edge**: Built into Windows 10/11
- **Safari**: Default on Mac computers

## Browser Interface
### Address Bar (URL Bar)
- Type website addresses here
- Also use it to search Google
- Shows security padlock for safe sites

### Navigation Buttons
- **Back Arrow**: Return to previous page
- **Forward Arrow**: Go forward if you went back
- **Refresh**: Reload current page
- **Home**: Return to your homepage

### Tabs
- Open multiple websites at once
- Click "+" to open new tab
- Click "X" on tab to close it
- **Ctrl+T**: New tab shortcut
- **Ctrl+W**: Close tab shortcut

### Bookmarks (Favorites)
Save websites you visit often:
1. Go to website
2. Click star icon or press Ctrl+D
3. Choose folder and name
4. Access from bookmarks menu

## Navigating Websites
- **Click Links**: Blue, underlined text or buttons
- **Scroll**: Use mouse wheel or drag scrollbar
- **Zoom**: Ctrl + Plus (larger), Ctrl + Minus (smaller)
- **Search on Page**: Ctrl+F to find specific words

## Private Browsing
- Doesn't save history or cookies
- Chrome: Ctrl+Shift+N (Incognito)
- Firefox: Ctrl+Shift+P (Private)
- Use for sensitive browsing (banking, shopping)

## Browser Settings
- Clear history and cookies regularly
- Set default search engine
- Manage saved passwords
- Block pop-ups
- Enable data saver mode (mobile)

## Practice Exercise
1. Open your web browser
2. Type "www.google.co.za" in address bar
3. Create a bookmark for Google
4. Open a new tab
5. Visit "www.wikipedia.org"
6. Search for "South Africa"
7. Practice using Back and Forward buttons
8. Close all tabs except one`,
            durationMinutes: 30,
            order: 2,
          },
        ],
      },
      {
        moduleId: 'module-3',
        title: 'Online Safety and Security',
        description: 'Protect yourself and your information online',
        order: 3,
        durationMinutes: 90,
        lessons: [
          {
            lessonId: 'lesson-3-1',
            title: 'Creating Strong Passwords',
            type: 'reading',
            content: `# Password Security

## Why Passwords Matter
Passwords protect your:
- Email accounts
- Social media profiles
- Banking information
- Personal photos and files
- Work documents

A weak password is like leaving your front door unlocked!

## What Makes a Strong Password?
### ✅ Good Password
- At least 12 characters long
- Mix of uppercase and lowercase letters
- Includes numbers
- Includes symbols (!, @, #, $, %)
- Not a dictionary word
- Unique for each account

### ❌ Weak Password
- Short (less than 8 characters)
- Common words (password, 123456)
- Personal info (name, birthday)
- Same password for multiple sites

## Examples
**Weak**: password123, john1985, qwerty
**Strong**: M7$kLp#2rQ9n, Tr3e!H0us€Blu3, 9Yx#mK2@pLq8

## Creating Memorable Strong Passwords
### Method 1: Passphrase
Take first letters of a sentence:
- "I love to visit Cape Town every December!"
- Password: ILt2vCT€D!

### Method 2: Substitute Characters
- "Sunshine" becomes "Sun$h1n€"
- "Mandela" becomes "M@nd€l@27"

### Method 3: Use a Pattern
- Pick 3 unrelated words + numbers + symbols
- "Purple!Elephant#42"

## Password Management
### Do:
- Use a password manager (LastPass, 1Password, Bitwarden)
- Write passwords in a secure notebook (locked drawer)
- Change passwords if account is hacked
- Use different passwords for important accounts

### Don't:
- Share passwords with anyone
- Email passwords to yourself
- Save passwords on shared computers
- Use the same password everywhere

## Two-Factor Authentication (2FA)
Extra security layer:
1. Enter your password (something you know)
2. Enter code from phone (something you have)

Enable 2FA on:
- Email (Gmail, Outlook)
- Banking apps
- Social media
- Any account with personal/financial info

## Password Checklist
- [ ] Minimum 12 characters
- [ ] Mix of upper and lowercase
- [ ] Includes numbers
- [ ] Includes symbols
- [ ] Not a dictionary word
- [ ] Unique to this account
- [ ] Not written on sticky note on monitor!

## Practice Exercise
1. Create a strong password for a fictional account
2. Check its strength at: haveibeenpwned.com
3. Change one of your real weak passwords today
4. Enable 2FA on your email account`,
            durationMinutes: 30,
            order: 1,
          },
        ],
      },
    ],
    createdBy: 'platform',
    estimatedHours: 6,
    thumbnailUrl: '/images/courses/digital-literacy.jpg',
    published: true,
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
  },
  
  {
    title: 'Microsoft Office Essentials',
    description: 'Master the essential Microsoft Office applications used in most workplaces. Learn Word for documents, Excel for spreadsheets, and PowerPoint for presentations.',
    shortDescription: 'Essential Office skills for work and life',
    track: 'computer-skills',
    category: 'Productivity',
    level: 'beginner',
    tags: ['microsoft word', 'excel', 'powerpoint', 'productivity', 'office'],
    tier: 'FREE',
    modules: [
      {
        moduleId: 'module-1',
        title: 'Microsoft Word Basics',
        description: 'Create and format professional documents',
        order: 1,
        durationMinutes: 180,
        lessons: [
          {
            lessonId: 'lesson-1-1',
            title: 'Introduction to Microsoft Word',
            type: 'reading',
            content: `# Getting Started with Microsoft Word

## What is Microsoft Word?
Microsoft Word is a word processing program used to create:
- Letters and reports
- Resumes and CVs
- Invitations and flyers
- School assignments
- Business documents

## Opening Microsoft Word
1. Click Start menu (Windows icon)
2. Type "Word" in search
3. Click "Microsoft Word"

## The Word Interface
### Ribbon
The toolbar at top with different tabs:
- **Home**: Common formatting (font, bold, align)
- **Insert**: Add pictures, tables, shapes
- **Design**: Page colors and themes
- **Layout**: Margins, orientation, columns
- **Review**: Spelling, grammar, comments

### Quick Access Toolbar
Small toolbar at very top:
- Save button (floppy disk icon)
- Undo (curved arrow left)
- Redo (curved arrow right)

### Document Area
Large white space where you type

## Creating Your First Document
1. Open Word
2. Choose "Blank Document"
3. Start typing immediately!

## Basic Typing
- Type normally like on phone or typewriter
- Press **Enter** for new paragraph
- Press **Spacebar** between words
- Press **Backspace** to delete

## Saving Your Document
**Method 1: Save Button**
1. Click floppy disk icon
2. Choose location (Documents folder)
3. Give it a name
4. Click "Save"

**Method 2: Keyboard Shortcut**
- Press Ctrl+S (hold Ctrl, press S)
- Much faster! Use this often

## Save As
Save a copy with different name:
- File menu → Save As
- Or F12 key

## Opening Existing Documents
- File menu → Open
- Or Ctrl+O
- Browse to location and select file

## Practice Exercise
1. Open Microsoft Word
2. Type a short paragraph about yourself
3. Save it as "My First Document"
4. Close Word
5. Open Word again and open your saved document`,
            durationMinutes: 30,
            order: 1,
          },
        ],
      },
    ],
    createdBy: 'platform',
    estimatedHours: 12,
    thumbnailUrl: '/images/courses/microsoft-office.jpg',
    published: true,
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
  },

  {
    title: 'Financial Literacy Basics',
    description: 'Learn to manage your money wisely. Understand budgeting, saving, debt management, and basic investing principles to build a secure financial future.',
    shortDescription: 'Master your money and build wealth',
    track: 'computer-skills',
    category: 'Finance',
    level: 'beginner',
    tags: ['budgeting', 'saving', 'investing', 'money management', 'finance'],
    tier: 'FREE',
    modules: [
      {
        moduleId: 'module-1',
        title: 'Introduction to Personal Finance',
        description: 'Understanding income, expenses, and building a budget',
        order: 1,
        durationMinutes: 120,
        lessons: [
          {
            lessonId: 'lesson-1-1',
            title: 'Understanding Income and Expenses',
            type: 'reading',
            content: `# Your Financial Foundation

## What is Personal Finance?
Personal finance is how you manage your money:
- Earning income
- Spending on needs and wants
- Saving for goals
- Avoiding debt problems
- Building wealth over time

## Income: Money Coming In
### Types of Income
- **Salary**: Regular payment from employer
- **Wages**: Hourly payment
- **Business Income**: From your own business
- **Investment Income**: From stocks, bonds, property
- **Government Grants**: SASSA, child support

### Understanding Your Payslip
Your gross salary vs take-home pay:
- Gross: Total before deductions
- PAYE: Tax to government
- UIF: Unemployment insurance
- Pension: Retirement savings
- Medical Aid: Health insurance
- Net/Take-Home: What you actually get

## Expenses: Money Going Out
### Fixed Expenses (same each month)
- Rent or bond payment
- Car payment
- Insurance premiums
- Cell phone contract
- DSTV/Netflix subscriptions
- School fees

### Variable Expenses (change monthly)
- Groceries
- Electricity and water
- Fuel/transport
- Airtime
- Entertainment
- Clothing

### Occasional Expenses
- Car repairs
- Medical bills
- Gifts for occasions
- Annual insurance

## Needs vs Wants
**Needs** (Essential):
- Food (basic groceries)
- Shelter (rent/bond)
- Utilities (electricity, water)
- Transportation (to work)
- Medical care
- Basic clothing

**Wants** (Nice to Have):
- Restaurant meals
- Latest phone
- Entertainment subscriptions
- Designer clothes
- Alcohol and cigarettes
- Expensive car

## South African Context
Average monthly expenses in SA:
- Single person: R8,000-R12,000
- Family of 4: R20,000-R35,000
- Minimum wage: ~R4,000/month

## The 50/30/20 Rule
Simple budgeting guideline:
- 50% for needs
- 30% for wants
- 20% for savings and debt

Example on R10,000 income:
- R5,000 for rent, food, transport
- R3,000 for fun, entertainment
- R2,000 for savings and paying off debt

## Practice Exercise
1. List all your income sources
2. List all fixed expenses
3. List average variable expenses
4. Calculate: Income - Expenses = ?
5. Are you spending more than you earn?`,
            durationMinutes: 40,
            order: 1,
          },
        ],
      },
    ],
    createdBy: 'platform',
    estimatedHours: 10,
    thumbnailUrl: '/images/courses/financial-literacy.jpg',
    published: true,
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
  },
];

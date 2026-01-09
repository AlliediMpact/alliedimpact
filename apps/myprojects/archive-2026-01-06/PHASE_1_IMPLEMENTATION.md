# My Projects - Phase 1 Implementation Plan
## Consistent Design with CoinBox Reference

**Start Date:** January 6, 2026  
**Target Completion:** Week 1 (20-25 hours)  
**Design Reference:** CoinBox App

---

## 🎨 Design System Analysis (From CoinBox)

### Color Palette
```typescript
primary: {
  DEFAULT: '#193281',  // Deep Blue
  light: '#3a57b0',
  dark: '#122260'
}
accent: {
  DEFAULT: '#5e17eb',  // Vibrant Purple
  light: '#7e45ef',
  dark: '#4b11c3'
}
status: {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}
```

### Component Patterns (From CoinBox)
- **Header:** Fixed top header with logo, search, notifications, user menu
- **Sidebar:** Collapsible left sidebar with navigation
- **Layout:** Dashboard shell with HeaderSidebar wrapper
- **Cards:** shadcn/ui Card components with consistent styling
- **Icons:** Lucide React icons throughout
- **Dropdown:** shadcn/ui DropdownMenu for user actions
- **Theme:** Light/Dark mode toggle
- **Animations:** Framer Motion for smooth transitions

### Typography
- **Font:** Inter (system-ui fallback)
- **Headings:** Bold, clear hierarchy
- **Body:** Regular weight, readable line-height

---

## 📋 Phase 1 Implementation Tasks

### Task 1: Shared Navigation Component (4 hours) ✅
**Goal:** Create reusable navigation system matching CoinBox

**Files to Create:**
1. `apps/myprojects/components/AppLayout.tsx` - Main layout wrapper
2. `apps/myprojects/components/AppHeader.tsx` - Top header with logo, search, user menu
3. `apps/myprojects/components/AppSidebar.tsx` - Left navigation sidebar
4. `apps/myprojects/components/Logo.tsx` - Consistent logo component

**Features:**
- Fixed header with logo on left
- Search bar (mobile: icon, desktop: input)
- Notification bell icon (with unread count)
- User dropdown menu (profile, settings, logout)
- Collapsible sidebar (mobile: drawer, desktop: fixed)
- Active route highlighting
- Theme toggle (light/dark)
- Responsive design

**Navigation Items for My Projects:**
```typescript
[
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Projects', icon: Briefcase, href: '/projects' },
  { label: 'Milestones', icon: Flag, href: '/milestones' },
  { label: 'Deliverables', icon: FileText, href: '/deliverables' },
  { label: 'Tickets', icon: MessageSquare, href: '/tickets' },
  { label: 'Team', icon: Users, href: '/team' },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '/help' }
]
```

---

### Task 2: User Settings Page (5 hours) ✅
**Goal:** Complete profile and account management

**Route:** `/settings`

**Tabs:**
1. **Profile** (settings/profile)
   - Display name
   - Email (read-only, show verified badge)
   - Avatar upload (Firebase Storage)
   - Phone number (optional)
   - Save button with loading state

2. **Security** (settings/security)
   - Current password
   - New password
   - Confirm password
   - Change password button
   - Password requirements shown
   - Success/error messages

3. **Notifications** (settings/notifications)
   - Email notifications toggle
   - Types: New milestones, Deliverable updates, Ticket replies, Deadline reminders
   - In-app notifications toggle
   - Notification frequency (Instant, Daily digest, Weekly)

4. **Preferences** (settings/preferences)
   - Timezone selector
   - Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
   - Time format (12h, 24h)
   - Language selector
   - Theme (Light, Dark, System)

**Components:**
- `app/settings/layout.tsx` - Settings layout with tabs
- `app/settings/page.tsx` - Redirect to /settings/profile
- `app/settings/profile/page.tsx`
- `app/settings/security/page.tsx`
- `app/settings/notifications/page.tsx`
- `app/settings/preferences/page.tsx`

---

### Task 3: Password Reset Flow (2 hours) ✅
**Goal:** Allow users to reset forgotten passwords

**Files to Modify/Create:**
1. `app/login/page.tsx` - Add "Forgot Password?" link
2. `app/forgot-password/page.tsx` - Password reset email form
3. `app/reset-password/page.tsx` - Set new password form
4. `components/PasswordResetDialog.tsx` - Optional modal version

**Flow:**
1. User clicks "Forgot Password" on login
2. Enters email address
3. Firebase sends password reset email
4. User clicks link in email
5. Redirects to reset-password page
6. User enters new password
7. Success message + redirect to login

---

### Task 4: Project Switcher (2 hours) ✅
**Goal:** Easy switching between multiple projects

**Implementation:**
- Dropdown in header (next to logo or user menu)
- Shows current project name
- List all user projects
- Search/filter projects
- Quick stats per project (status, progress)
- Recently viewed projects highlighted
- Pin/favorite projects option

**Component:**
- `components/ProjectSwitcher.tsx`

**Features:**
- Current project badge
- Project status indicator (color dot)
- Progress percentage
- Last activity timestamp
- Keyboard navigation (↑↓ to navigate, Enter to select)

---

### Task 5: Loading Skeletons (3 hours) ✅
**Goal:** Better perceived performance

**Components to Create:**
- `components/skeletons/ProjectCardSkeleton.tsx`
- `components/skeletons/MilestoneCardSkeleton.tsx`
- `components/skeletons/DeliverableCardSkeleton.tsx`
- `components/skeletons/TicketCardSkeleton.tsx`
- `components/skeletons/StatsCardSkeleton.tsx`
- `components/skeletons/TableSkeleton.tsx`

**Usage:**
Replace loading spinners with appropriate skeletons:
```tsx
{loading ? (
  <ProjectCardSkeleton count={3} />
) : (
  projects.map(p => <ProjectCard project={p} />)
)}
```

---

### Task 6: Search & Filter System (4 hours) ✅
**Goal:** Find items quickly in large lists

**Components:**
1. `components/SearchBar.tsx` - Reusable search input
2. `components/FilterPanel.tsx` - Filter options sidebar
3. `components/SortDropdown.tsx` - Sort options

**Features:**

**Search:**
- Real-time search (debounced 300ms)
- Search across: milestone names, deliverable titles, ticket subjects
- Keyboard shortcut: `/` to focus search
- Clear button (X icon)
- Recent searches dropdown

**Filter Options:**
- **Milestones:** Status (Pending, In Progress, Completed, Overdue)
- **Deliverables:** Status (Pending, In Progress, Delivered, Approved)
- **Tickets:** Priority (Low, Medium, High, Urgent), Status (Open, In Progress, Resolved)
- **Date Range:** This week, This month, Last 30 days, Custom range

**Sort Options:**
- Date created (newest/oldest)
- Due date (soonest/latest)
- Name (A-Z, Z-A)
- Status
- Priority (tickets only)

**Implementation:**
```typescript
// URL params for shareable filters
/dashboard?search=design&status=in_progress&sort=due_date
```

---

### Task 7: Milestone-Deliverable Linking (3 hours) ✅
**Goal:** Visual connection between milestones and deliverables

**Changes:**

1. **Milestone Cards Enhancement:**
   - Show linked deliverables count badge
   - Progress bar calculation from deliverables
   - Expandable section showing deliverable list
   - Click deliverable to navigate

2. **Deliverable Form:**
   - Milestone selector dropdown
   - Show milestone name and due date
   - Warning if deliverable due date > milestone due date

3. **Milestone Detail View:**
   - Dedicated section for deliverables
   - Add deliverable button (pre-fills milestone)
   - Deliverable progress affects milestone progress
   - Completion logic: All deliverables approved = milestone complete

**Component Updates:**
- `components/MilestoneManager.tsx` - Add deliverables section
- `components/DeliverableManager.tsx` - Add milestone selector
- `components/MilestoneDetailModal.tsx` - New modal with full details

---

### Task 8: Enhanced Empty States (1 hour) ✅
**Goal:** More actionable empty states

**Improvements:**
1. **No Projects:**
   - Larger icon
   - Clear heading
   - Descriptive text
   - Primary CTA: "Contact Sales"
   - Secondary: "Watch Demo"

2. **No Milestones:**
   - Calendar icon
   - "Add your first milestone"
   - Quick tips
   - "Add Milestone" button
   - "Import Template" option

3. **No Deliverables:**
   - File icon
   - "Create your first deliverable"
   - Example deliverables list
   - "Add Deliverable" button

4. **No Tickets:**
   - Message icon
   - "No support tickets yet"
   - "Create Ticket" button
   - "Browse FAQ" link

---

## 🎨 Style Guide Implementation

### Tailwind Config Updates
```typescript
// apps/myprojects/tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#193281',
        light: '#3a57b0',
        dark: '#122260'
      },
      accent: {
        DEFAULT: '#5e17eb',
        light: '#7e45ef',
        dark: '#4b11c3'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      }
    }
  }
}
```

### Component Styling Patterns

**Card:**
```tsx
<Card className="border-primary/10 hover:border-primary/30 transition-colors">
  <CardHeader className="border-b border-primary/10">
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    Content
  </CardContent>
</Card>
```

**Button:**
```tsx
<Button variant="default" className="bg-primary hover:bg-primary/90">
  Primary Action
</Button>

<Button variant="outline" className="border-primary text-primary">
  Secondary Action
</Button>
```

**Status Badge:**
```tsx
<Badge className="bg-status-success/10 text-status-success border-status-success/20">
  Active
</Badge>

<Badge className="bg-status-warning/10 text-status-warning border-status-warning/20">
  Pending
</Badge>
```

---

## 📱 Responsive Design Breakpoints

**Mobile First:**
```typescript
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

**Layout Behavior:**
- Mobile (<768px): Bottom nav + hamburger menu
- Tablet (768px-1024px): Collapsible sidebar
- Desktop (>1024px): Fixed sidebar

---

## 🔧 Technical Implementation Details

### Shared Components Location
Create in monorepo packages for reuse:
```
packages/ui/
  ├── AppLayout.tsx
  ├── AppHeader.tsx
  ├── AppSidebar.tsx
  ├── Logo.tsx
  └── skeletons/
```

### State Management
- Use React Context for:
  - Current project
  - User preferences
  - Theme
  - Navigation state (sidebar open/closed)

### Performance
- Lazy load components
- Memoize navigation items
- Debounce search
- Virtual scrolling for long lists

---

## ✅ Acceptance Criteria

Each task must meet:

1. **Visual Consistency**
   - Matches CoinBox design language
   - Uses shared color palette
   - Consistent spacing and typography
   - Proper icon usage

2. **Functionality**
   - Feature works as specified
   - No console errors
   - Handles edge cases
   - Loading states present

3. **Responsive**
   - Works on mobile (375px+)
   - Works on tablet (768px+)
   - Works on desktop (1024px+)
   - No horizontal scroll

4. **Accessibility**
   - Keyboard navigable
   - ARIA labels present
   - Focus indicators visible
   - Color contrast meets WCAG AA

5. **Performance**
   - Page load < 3s
   - Smooth animations (60fps)
   - No layout shift
   - Optimized images

---

## 📊 Progress Tracking

### Sprint Schedule (Week 1)

**Day 1-2: Layout & Navigation (8 hours)**
- ✅ AppLayout component
- ✅ AppHeader component
- ✅ AppSidebar component
- ✅ Logo component
- ✅ Theme toggle
- ✅ User menu dropdown

**Day 3: Settings & Auth (7 hours)**
- ✅ Settings page with tabs
- ✅ Profile settings
- ✅ Security settings
- ✅ Password reset flow

**Day 4: Project Management (7 hours)**
- ✅ Project switcher
- ✅ Search & filter system
- ✅ Milestone-deliverable linking

**Day 5: Polish & Testing (3 hours)**
- ✅ Loading skeletons
- ✅ Enhanced empty states
- ✅ Bug fixes
- ✅ Responsive testing

---

## 🚀 Implementation Order

1. **Setup** (30 min)
   - Update tailwind.config.ts with CoinBox colors
   - Install required dependencies
   - Create folder structure

2. **Core Layout** (4 hours)
   - AppLayout wrapper
   - AppHeader component
   - AppSidebar component
   - Logo component

3. **Authentication** (2 hours)
   - User menu dropdown
   - Logout functionality
   - Password reset flow

4. **Settings** (5 hours)
   - Settings layout
   - All settings tabs
   - Form validations

5. **Project Features** (7 hours)
   - Project switcher
   - Search & filter
   - Milestone linking

6. **UI Polish** (4 hours)
   - Loading skeletons
   - Empty states
   - Animations
   - Testing

**Total: ~22.5 hours**

---

## 🎯 Success Metrics

**Before Phase 1:**
- No navigation
- No settings
- No search
- Basic loading states
- Simple empty states

**After Phase 1:**
- Complete navigation system ✅
- Full settings page ✅
- Advanced search & filter ✅
- Skeleton loaders everywhere ✅
- Actionable empty states ✅
- Consistent design language ✅
- Professional appearance ✅

---

## 📝 Next Steps

After Phase 1 completion, we'll move to:
- **Phase 2:** Activity feed, notifications, team management
- **Phase 3:** Bulk actions, exports, keyboard shortcuts
- **Phase 4:** Calendar view, analytics, advanced features

---

**Ready to start implementation!** 🚀


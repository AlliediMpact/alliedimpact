# UI/UX Enhancement System - Complete Guide

## Overview

This comprehensive UI/UX enhancement system provides 60+ animated, accessible, and mobile-first components built with Framer Motion and Tailwind CSS. All components follow a consistent design language with purple/blue gradients and smooth animations.

## Table of Contents

1. [Animation System](#animation-system)
2. [Button Components](#button-components)
3. [Card Components](#card-components)
4. [Form Components](#form-components)
5. [Loading States](#loading-states)
6. [Dashboard Components](#dashboard-components)
7. [Navigation Components](#navigation-components)
8. [Onboarding Components](#onboarding-components)
9. [Data Visualization](#data-visualization)
10. [Preferences System](#preferences-system)
11. [Mobile Components](#mobile-components)

---

## Animation System

**File:** `src/lib/animations.ts`

Central animation library with 30+ pre-configured animation variants.

### Available Animations

```typescript
import {
  pageTransition,
  fadeIn, fadeInUp, fadeInDown,
  scaleIn, scaleUp,
  slideInLeft, slideInRight,
  staggerContainer,
  cardHover, buttonHover,
  modalBackdrop, toastSlideIn,
  spinnerRotate, pulse, glow, shake,
  checkmark, accordion, fabAnimation
} from '@/lib/animations';
```

### Usage Example

```tsx
<motion.div
  variants={fadeInUp}
  initial="initial"
  animate="animate"
>
  Content
</motion.div>
```

---

## Button Components

**File:** `src/components/ui/animated-button.tsx`

### AnimatedButton

Animated button with ripple effect and loading states.

```tsx
<AnimatedButton
  variant="primary" // primary, secondary, outline, ghost, danger
  loading={false}
  icon={<Icon />}
  onClick={handleClick}
>
  Click Me
</AnimatedButton>
```

### AnimatedIconButton

Icon-only button variant.

```tsx
<AnimatedIconButton
  icon={<Settings />}
  variant="ghost"
  onClick={handleSettings}
/>
```

**Features:**
- 5 color variants
- Ripple effect on click
- Loading spinner state
- Hover/tap animations
- Icon support

---

## Card Components

**File:** `src/components/ui/animated-card.tsx`

### AnimatedCard

Basic animated card with hover effects.

```tsx
<AnimatedCard hover={true} glow={true}>
  <h3>Card Title</h3>
  <p>Card content</p>
</AnimatedCard>
```

### GlassCard

Card with glassmorphism effect.

```tsx
<GlassCard>
  <p>Transparent glass effect card</p>
</GlassCard>
```

### StatCard

Card with animated counter and trend indicator.

```tsx
<StatCard
  title="Total Revenue"
  value={125000}
  change={12.5}
  icon={<DollarSign />}
  format="currency"
/>
```

**Features:**
- Hover animations
- Gradient backgrounds
- Glow effects
- Glassmorphism
- Trend indicators

---

## Form Components

**Files:** 
- `src/components/ui/animated-input.tsx`
- `src/components/ui/multi-step-form.tsx`

### AnimatedInput

Input with real-time validation and animations.

```tsx
<AnimatedInput
  label="Email"
  type="email"
  icon={<Mail />}
  validate={(value) => {
    if (!value.includes('@')) return 'Invalid email';
  }}
  error={error}
  success={success}
  showPasswordToggle={true}
/>
```

### PasswordStrength

Visual password strength indicator.

```tsx
<PasswordStrength password={password} />
```

### AnimatedTextarea

Textarea with character count.

```tsx
<AnimatedTextarea
  label="Description"
  maxLength={500}
  showCount={true}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

### MultiStepForm

Multi-step form with progress tracking and auto-save.

```tsx
const steps = [
  {
    id: 'step1',
    title: 'Personal Info',
    description: 'Enter your details',
    component: <Step1Component />,
    validate: async () => { /* validation logic */ }
  },
  // ... more steps
];

<MultiStepForm
  steps={steps}
  onComplete={handleComplete}
  autoSave={true}
  autoSaveInterval={3000}
/>
```

**Features:**
- Real-time validation with animations
- Password strength meter
- Character counters
- Auto-save functionality
- Progress indicators
- Step navigation

---

## Loading States

**File:** `src/components/ui/loading-states.tsx`

### Skeleton

Animated skeleton loader.

```tsx
<Skeleton className="h-20 w-full" />
```

### CardSkeleton / TableSkeleton

Pre-built skeleton layouts.

```tsx
<CardSkeleton />
<TableSkeleton rows={5} />
```

### Spinner

Rotating spinner loader.

```tsx
<Spinner size="md" /> // sm, md, lg
```

### PageLoader

Full-page loading overlay.

```tsx
<PageLoader />
```

### FileUploadProgress

Progress indicator for file uploads.

```tsx
<FileUploadProgress
  fileName="document.pdf"
  progress={75}
  status="uploading" // uploading, success, error
  onCancel={handleCancel}
/>
```

### DotsLoader / PulseLoader

Alternative loading animations.

```tsx
<DotsLoader />
<PulseLoader />
```

**Features:**
- Skeleton screens
- Shimmer effects
- Progress indicators
- File upload tracking
- Multiple loader styles

---

## Dashboard Components

**File:** `src/components/ui/dashboard-components.tsx`

### DashboardStat

Stat card with animated counter.

```tsx
<DashboardStat
  title="Active Users"
  value={1250}
  change={15}
  changeLabel="vs last month"
  icon={<Users />}
  format="number"
/>
```

### DashboardStatsGrid

Grid container for stats.

```tsx
<DashboardStatsGrid columns={4}>
  <DashboardStat {...stat1} />
  <DashboardStat {...stat2} />
  {/* ... */}
</DashboardStatsGrid>
```

### QuickAction

Quick action button.

```tsx
<QuickAction
  icon={<Plus />}
  label="New Transaction"
  onClick={handleNew}
  variant="primary"
/>
```

### FAB (Floating Action Button)

Animated floating action button.

```tsx
<FAB
  icon={<Plus />}
  label="Add"
  position="bottom-right"
  onClick={handleAdd}
/>
```

### ActivityFeed

Feed of recent activities.

```tsx
<ActivityFeed
  items={[
    {
      id: '1',
      title: 'New user registered',
      description: 'John Doe created an account',
      timestamp: '2 hours ago',
      icon: <UserPlus />,
      variant: 'success'
    }
  ]}
/>
```

### ChartContainer

Container for charts with loading state.

```tsx
<ChartContainer
  title="Revenue Overview"
  subtitle="Last 30 days"
  loading={false}
  action={<Button>Export</Button>}
>
  <YourChart />
</ChartContainer>
```

### MetricComparison

Compare current vs previous metrics.

```tsx
<MetricComparison
  title="Monthly Revenue"
  current={45000}
  previous={38000}
  format="currency"
/>
```

**Features:**
- Animated statistics
- Trend indicators
- Activity feeds
- Quick actions
- Floating buttons
- Metric comparisons

---

## Navigation Components

**File:** `src/components/ui/animated-navigation.tsx`

### AnimatedNav

Responsive navbar with animations.

```tsx
const navItems = [
  { label: 'Home', href: '/', icon: <Home /> },
  { label: 'Dashboard', href: '/dashboard', badge: 5 },
  {
    label: 'Settings',
    href: '/settings',
    children: [
      { label: 'Profile', href: '/settings/profile' },
      { label: 'Security', href: '/settings/security' }
    ]
  }
];

<AnimatedNav
  items={navItems}
  logo={<Logo />}
  actions={<ProfileButton />}
/>
```

### AnimatedSidebar

Collapsible sidebar navigation.

```tsx
<AnimatedSidebar
  items={navItems}
  collapsed={collapsed}
  onCollapse={setCollapsed}
/>
```

### AnimatedBreadcrumbs

Breadcrumb navigation.

```tsx
<AnimatedBreadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Details' }
  ]}
/>
```

**Features:**
- Responsive design
- Mobile menu
- Dropdown submenus
- Active link highlighting
- Badge support
- Collapsible sidebar
- Breadcrumb trails

---

## Onboarding Components

**File:** `src/components/ui/onboarding.tsx`

### Onboarding

Multi-step onboarding flow.

```tsx
const steps = [
  {
    id: 'welcome',
    title: 'Welcome!',
    description: 'Let\'s get you started',
    icon: <Sparkles />,
    content: <WelcomeContent />
  }
];

<Onboarding
  steps={steps}
  onComplete={handleComplete}
  onSkip={handleSkip}
  showProgress={true}
  allowSkip={true}
/>
```

### FeatureHighlight

Tooltip to highlight specific features.

```tsx
<FeatureHighlight
  target="#my-button"
  title="New Feature"
  description="Check out this new feature!"
  position="bottom"
  onNext={handleNext}
  onSkip={handleSkip}
/>
```

### WelcomeModal

Welcome modal with feature showcase.

```tsx
<WelcomeModal
  title="Welcome to CoinBox"
  description="Your crypto savings platform"
  features={[
    {
      icon: <Shield />,
      title: 'Secure',
      description: 'Bank-level security'
    }
  ]}
  onGetStarted={handleStart}
/>
```

**Features:**
- Step-by-step flows
- Progress tracking
- Feature tooltips
- Welcome screens
- Skip functionality

---

## Data Visualization

**File:** `src/components/ui/charts.tsx`

### AnimatedLineChart

Animated line chart with tooltips.

```tsx
<AnimatedLineChart
  data={[
    { label: 'Jan', value: 1000 },
    { label: 'Feb', value: 1500 },
    // ...
  ]}
  height={300}
  showGrid={true}
  showTooltip={true}
/>
```

### AnimatedBarChart

Animated bar chart.

```tsx
<AnimatedBarChart
  data={data}
  height={300}
  horizontal={false}
  showValues={true}
/>
```

### AnimatedDonutChart

Animated donut chart with legend.

```tsx
<AnimatedDonutChart
  data={[
    { label: 'Bitcoin', value: 45, color: 'text-orange-500' },
    { label: 'Ethereum', value: 30, color: 'text-blue-500' }
  ]}
  size={200}
  thickness={30}
  showLegend={true}
/>
```

### Sparkline

Mini inline chart.

```tsx
<Sparkline
  data={[10, 15, 12, 18, 20, 17]}
  height={40}
  showDots={false}
  color="text-purple-600"
/>
```

**Features:**
- Interactive tooltips
- Smooth animations
- Multiple chart types
- Responsive sizing
- Customizable colors

---

## Preferences System

**File:** `src/components/ui/preferences.tsx`

### ToggleSwitch

Animated toggle switch.

```tsx
<ToggleSwitch
  enabled={notifications}
  onChange={setNotifications}
  label="Push Notifications"
  description="Receive push notifications"
/>
```

### RadioGroup

Radio button group with animations.

```tsx
<RadioGroup
  options={[
    { value: 'light', label: 'Light', icon: <Sun /> },
    { value: 'dark', label: 'Dark', icon: <Moon /> }
  ]}
  value={theme}
  onChange={setTheme}
  label="Theme"
/>
```

### Slider

Animated range slider.

```tsx
<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={1}
  label="Volume"
  showValue={true}
/>
```

### ThemeSelector

Theme selection component.

```tsx
<ThemeSelector />
```

### PreferencesPanel

Full preferences panel with sections.

```tsx
const sections = [
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <Palette />,
    settings: [
      {
        id: 'theme',
        label: 'Theme',
        type: 'radio',
        value: theme,
        options: themeOptions,
        onChange: setTheme
      }
    ]
  }
];

<PreferencesPanel sections={sections} />
```

**Features:**
- Theme switching
- Toggle switches
- Radio groups
- Range sliders
- Organized sections

---

## Mobile Components

**File:** `src/components/ui/mobile-components.tsx`

### SwipeableCard

Card with swipe gestures.

```tsx
<SwipeableCard
  onSwipeLeft={handleDelete}
  onSwipeRight={handleArchive}
  threshold={100}
>
  <CardContent />
</SwipeableCard>
```

### BottomSheet

Mobile bottom sheet modal.

```tsx
<BottomSheet
  isOpen={isOpen}
  onClose={handleClose}
  title="Options"
  snapPoints={[50, 90]}
>
  <SheetContent />
</BottomSheet>
```

### PullToRefresh

Pull-to-refresh functionality.

```tsx
<PullToRefresh
  onRefresh={async () => {
    await fetchData();
  }}
  threshold={80}
>
  <Content />
</PullToRefresh>
```

### MobileDrawer

Side drawer for mobile.

```tsx
<MobileDrawer
  isOpen={isOpen}
  onClose={handleClose}
  side="left"
>
  <DrawerContent />
</MobileDrawer>
```

### MobileAccordion

Touch-friendly accordion.

```tsx
<MobileAccordion
  title="Section Title"
  icon={<Icon />}
  defaultOpen={false}
>
  <Content />
</MobileAccordion>
```

### MobileTabs

Horizontal scrollable tabs.

```tsx
<MobileTabs
  tabs={[
    { id: 'all', label: 'All', icon: <Grid /> },
    { id: 'favorites', label: 'Favorites', icon: <Star /> }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### FloatingActionMenu

Expandable FAB menu.

```tsx
<FloatingActionMenu
  items={[
    { icon: <Plus />, label: 'Add', onClick: handleAdd },
    { icon: <Upload />, label: 'Upload', onClick: handleUpload }
  ]}
/>
```

### SafeAreaContainer

Container with safe area insets.

```tsx
<SafeAreaContainer>
  <Content />
</SafeAreaContainer>
```

**Features:**
- Touch gestures
- Swipe actions
- Pull-to-refresh
- Bottom sheets
- Drawers
- Safe area support

---

## Best Practices

### 1. Animation Performance

```tsx
// Use transform and opacity for best performance
<motion.div
  style={{ x, y, opacity }}
  animate={{ x: 100, y: 50, opacity: 1 }}
/>
```

### 2. Accessibility

```tsx
// Always include labels and ARIA attributes
<AnimatedButton
  aria-label="Close menu"
  onClick={handleClose}
>
  <X />
</AnimatedButton>
```

### 3. Mobile-First

```tsx
// Use responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Content */}
</div>
```

### 4. Dark Mode

All components support dark mode with Tailwind's `dark:` prefix.

### 5. Loading States

Always show loading states for async operations.

```tsx
<AnimatedButton loading={isLoading}>
  Submit
</AnimatedButton>
```

---

## Component Combinations

### Dashboard Layout

```tsx
<div className="p-6 space-y-6">
  <DashboardStatsGrid columns={4}>
    <DashboardStat {...stats} />
  </DashboardStatsGrid>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartContainer title="Revenue">
      <AnimatedLineChart data={revenueData} />
    </ChartContainer>
    
    <ChartContainer title="Distribution">
      <AnimatedDonutChart data={distributionData} />
    </ChartContainer>
  </div>

  <ActivityFeed items={activities} />
  
  <FAB icon={<Plus />} onClick={handleAdd} />
</div>
```

### Form with Validation

```tsx
<MultiStepForm
  steps={[
    {
      id: 'account',
      title: 'Account Details',
      component: (
        <div className="space-y-4">
          <AnimatedInput
            label="Email"
            type="email"
            icon={<Mail />}
            validate={(v) => v.includes('@') ? undefined : 'Invalid email'}
          />
          <AnimatedInput
            label="Password"
            type="password"
            showPasswordToggle
          />
          <PasswordStrength password={password} />
        </div>
      )
    }
  ]}
  onComplete={handleSubmit}
  autoSave={true}
/>
```

### Mobile Navigation

```tsx
<>
  <AnimatedNav items={navItems} />
  
  <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
    <AnimatedSidebar items={navItems} />
  </MobileDrawer>
  
  <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
    <QuickPreferences />
  </BottomSheet>
</>
```

---

## Migration Guide

### Replacing Existing Components

1. **Buttons**: Replace with `AnimatedButton`
2. **Cards**: Replace with `AnimatedCard` or `StatCard`
3. **Inputs**: Replace with `AnimatedInput`
4. **Loaders**: Replace with appropriate loading components
5. **Navigation**: Replace with `AnimatedNav` or `AnimatedSidebar`

### Import Changes

```tsx
// Old
import { Button } from '@/components/ui/button';

// New
import { AnimatedButton } from '@/components/ui';
```

---

## Customization

### Theme Colors

Modify `tailwind.config.ts` to customize colors:

```ts
theme: {
  extend: {
    colors: {
      purple: { /* custom shades */ },
      blue: { /* custom shades */ }
    }
  }
}
```

### Animation Timing

Modify `src/lib/animations.ts` to adjust animation speeds:

```ts
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 } // Adjust duration
  }
};
```

---

## Performance Tips

1. **Lazy Load**: Use dynamic imports for heavy components
2. **Memoization**: Wrap components in `React.memo` when appropriate
3. **Virtual Lists**: Use for long lists of items
4. **Debounce**: Debounce form inputs and search
5. **Image Optimization**: Use Next.js Image component

---

## Troubleshooting

### Animations Not Working

- Ensure Framer Motion is installed: `npm install framer-motion`
- Check that animations are enabled in accessibility settings

### Dark Mode Issues

- Ensure `dark` class is on `<html>` element
- Check Tailwind dark mode configuration

### Mobile Gestures Not Working

- Ensure touch events are not prevented
- Check that drag constraints are properly set

---

## Support & Resources

- **Framer Motion Docs**: https://www.framer.com/motion/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Changelog

### v1.0.0 (Current)
- ✅ Complete animation system
- ✅ 60+ components
- ✅ Mobile-first design
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ TypeScript support

---

**Created for CoinBox Platform**
All components are production-ready and fully tested.

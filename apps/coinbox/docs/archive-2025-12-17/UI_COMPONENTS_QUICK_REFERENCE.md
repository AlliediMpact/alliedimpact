# UI Components Quick Reference

## Import All Components
```tsx
import { /* component names */ } from '@/components/ui';
```

## Buttons
```tsx
<AnimatedButton variant="primary" loading={false}>Click</AnimatedButton>
<AnimatedIconButton icon={<Icon />} variant="ghost" />
```

## Cards
```tsx
<AnimatedCard hover glow>Content</AnimatedCard>
<GlassCard>Glassmorphism</GlassCard>
<StatCard title="Revenue" value={125000} change={12.5} format="currency" />
```

## Forms
```tsx
<AnimatedInput label="Email" validate={fn} icon={<Mail />} />
<PasswordStrength password={pwd} />
<AnimatedTextarea maxLength={500} showCount />
<MultiStepForm steps={steps} onComplete={fn} autoSave />
```

## Loading
```tsx
<Skeleton className="h-20 w-full" />
<Spinner size="md" />
<PageLoader />
<FileUploadProgress fileName="doc.pdf" progress={75} status="uploading" />
```

## Progress
```tsx
<AnimatedProgressBar value={75} variant="success" showPercentage />
<CircularProgress value={60} size={100} />
<StepProgress steps={['One', 'Two', 'Three']} currentStep={1} />
```

## Dashboard
```tsx
<DashboardStatsGrid columns={4}>
  <DashboardStat title="Users" value={1250} change={15} />
</DashboardStatsGrid>
<FAB icon={<Plus />} position="bottom-right" onClick={fn} />
<ActivityFeed items={activities} />
```

## Navigation
```tsx
<AnimatedNav items={navItems} logo={<Logo />} />
<AnimatedSidebar items={navItems} collapsed={false} />
<AnimatedBreadcrumbs items={breadcrumbs} />
```

## Charts
```tsx
<AnimatedLineChart data={data} height={300} showTooltip />
<AnimatedBarChart data={data} horizontal={false} />
<AnimatedDonutChart data={data} size={200} showLegend />
<Sparkline data={[10, 15, 20]} height={40} />
```

## Onboarding
```tsx
<Onboarding steps={steps} onComplete={fn} showProgress allowSkip />
<FeatureHighlight target="#button" title="New" description="Try this!" />
<WelcomeModal title="Welcome" features={features} onGetStarted={fn} />
```

## Preferences
```tsx
<ToggleSwitch enabled={state} onChange={fn} label="Notifications" />
<RadioGroup options={opts} value={val} onChange={fn} />
<Slider value={50} min={0} max={100} onChange={fn} />
<ThemeSelector />
```

## Mobile
```tsx
<SwipeableCard onSwipeLeft={fn} onSwipeRight={fn}>Content</SwipeableCard>
<BottomSheet isOpen={open} onClose={fn} snapPoints={[50, 90]} />
<PullToRefresh onRefresh={async fn}>Content</PullToRefresh>
<MobileDrawer isOpen={open} side="left">Content</MobileDrawer>
<MobileTabs tabs={tabs} activeTab={active} onChange={fn} />
```

## Animations
```tsx
import { fadeInUp, scaleIn, slideInLeft } from '@/lib/animations';

<motion.div variants={fadeInUp} initial="initial" animate="animate">
  Content
</motion.div>
```

## Common Props

### Variants
- Buttons: `primary | secondary | outline | ghost | danger`
- Progress: `default | success | warning | danger`

### Formats
- StatCard/Counter: `number | currency | percentage`

### Sizes
- Spinner: `sm | md | lg`
- Buttons: `sm | md | lg`

### Positions
- FAB: `bottom-right | bottom-left | top-right | top-left`

## Color Classes
```tsx
className="bg-purple-600 text-white"
className="from-purple-600 to-blue-600" // gradients
className="dark:bg-gray-800" // dark mode
```

## Responsive
```tsx
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

## Accessibility
```tsx
<AnimatedButton aria-label="Close">
  <X />
</AnimatedButton>
```

## Key Features
- ✨ Framer Motion animations
- 🌙 Dark mode support
- 📱 Mobile-first design
- ♿ Accessibility built-in
- 🎨 Consistent theming
- ⚡ Performance optimized

## Documentation
📘 Full Guide: `docs/UI_UX_ENHANCEMENT_GUIDE.md`
📄 Summary: `docs/UI_UX_IMPLEMENTATION_SUMMARY.md`

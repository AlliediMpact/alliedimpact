# Phase 1 Enhancements - Quick Reference Guide

## 🎨 UI Components

### Skeleton Loading Screens
```tsx
import { 
  SkeletonCard, 
  SkeletonDashboard,
  SkeletonTransactionList 
} from '@/components/ui/skeleton-card';

// Use in loading states
{loading ? <SkeletonDashboard /> : <Dashboard />}
```

### Empty States
```tsx
import { 
  EmptyTransactions, 
  EmptyNotifications,
  EmptyState 
} from '@/components/ui/empty-state';

// Predefined states
{transactions.length === 0 ? <EmptyTransactions /> : <TransactionList />}

// Custom empty state
<EmptyState
  icon={<MyIcon />}
  title="No data yet"
  description="Start by adding your first item"
  action={<Button>Add Item</Button>}
/>
```

### Enhanced Error Boundary
```tsx
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';

// Wrap components
<EnhancedErrorBoundary>
  <YourComponent />
</EnhancedErrorBoundary>

// Use error hook
import { useErrorHandler } from '@/components/ui/enhanced-error-boundary';

function MyComponent() {
  const handleError = useErrorHandler();
  
  try {
    // your code
  } catch (error) {
    handleError(error);
  }
}
```

## 🔄 Real-time Features

### WebSocket Hook
```tsx
import { useWebSocket, useTransactionFeed } from '@/hooks/use-websocket';

// Basic WebSocket
const { isConnected, lastMessage, send } = useWebSocket({
  url: 'ws://localhost:3001',
  onMessage: (msg) => console.log(msg),
});

// Transaction Feed
const { transactions, stats, isConnected } = useTransactionFeed();
```

### Live Transaction Feed
```tsx
import { LiveTransactionFeed } from '@/components/live-transaction-feed';

// In your component
<LiveTransactionFeed />
```

### Start WebSocket Server
```bash
# Terminal 1 - WebSocket server
npm run ws:dev

# Terminal 2 - Next.js app
npm run dev
```

## 📊 Analytics Export

### Export Button
```tsx
import { ExportButton } from '@/components/export-button';

<ExportButton
  data={analyticsData}
  filename="analytics_report"
  title="Analytics Dashboard"
  columns={[
    { header: 'Metric', key: 'metric' },
    { header: 'Value', key: 'value' },
  ]}
/>
```

### Export Formats
- **CSV** - Excel compatible
- **Excel** - .xls format
- **PDF** - Professional reports
- **JSON** - Raw data

## 🌐 SEO Configuration

### Page Metadata
```tsx
// app/page-name/page.tsx
export const metadata = {
  title: 'Page Title | Allied iMpact Coin Box',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
};
```

### Structured Data
```tsx
import { organizationSchema, breadcrumbSchema } from '@/lib/structured-data';

// Add to page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
```

### Sitemap & Robots
- Sitemap: `https://yoursite.com/sitemap.xml`
- Robots: `https://yoursite.com/robots.txt`

## ♿ Accessibility

### Accessibility Hooks
```tsx
import { 
  useAccessibility,
  useKeyboardNavigation,
  useFocusTrap 
} from '@/hooks/use-accessibility';

// Route announcements
useAccessibility();

// Keyboard navigation
useKeyboardNavigation({
  onEscape: () => closeModal(),
  onEnter: () => submit(),
});

// Focus trap for modals
const modalRef = useRef(null);
useFocusTrap(modalRef, isOpen);
```

### Accessibility Utils
```tsx
import {
  getAriaInvalid,
  getLoadingAttributes,
  formatNumberForScreenReader,
} from '@/lib/accessibility-utils';

// Form validation
<input {...getAriaInvalid(error)} />

// Loading states
<div {...getLoadingAttributes(isLoading)}>Content</div>

// Screen reader text
aria-label={formatNumberForScreenReader(1000000)} // "1 million"
```

### Skip to Main Content
Already included in layout.tsx - press Tab on page load

## 🚀 Performance Optimization

### Lazy Loading
```tsx
import { 
  AdvancedAnalyticsDashboard,
  P2PTradingDashboard,
  preloadComponent,
  preloadRouteComponents,
} from '@/lib/lazy-loading';

// Dynamic component
<AdvancedAnalyticsDashboard />

// Preload on hover
<Link
  href="/dashboard/analytics"
  onMouseEnter={() => preloadComponent('AdvancedAnalyticsDashboard')}
>
  Analytics
</Link>

// Preload route components
useEffect(() => {
  preloadRouteComponents('/dashboard/analytics');
}, []);
```

### Performance Utils
```tsx
import {
  debounce,
  throttle,
  lazyLoadImage,
  prefetchOnVisible,
} from '@/lib/performance-utils';

// Debounce search
const debouncedSearch = debounce(searchFunction, 300);

// Throttle scroll handler
const throttledScroll = throttle(scrollHandler, 100);

// Lazy load images
const imgRef = useRef(null);
useEffect(() => {
  if (imgRef.current) {
    lazyLoadImage(imgRef.current);
  }
}, []);
```

## 🌙 Theme Management

### Dark Mode (Already Exists)
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function Component() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Dark Mode
    </button>
  );
}
```

Theme options: `'light'`, `'dark'`, `'system'`

## 📱 PWA Features

### Offline Support
- Automatic offline detection
- Beautiful offline page
- Auto-reconnect when online
- Service worker caching

### Check PWA Status
```tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    console.log('PWA is active');
  });
}
```

## 🔍 Testing Checklist

### Dark Mode
- [ ] Toggle between light/dark/system
- [ ] Check localStorage persistence
- [ ] Verify smooth transitions

### WebSocket
- [ ] Start ws-server: `npm run ws:dev`
- [ ] Check connection indicator
- [ ] Verify live transaction updates
- [ ] Test reconnection on disconnect

### PWA Offline
- [ ] Open DevTools > Network > Offline
- [ ] Navigate pages
- [ ] Check offline page display
- [ ] Verify auto-reload on reconnect

### Analytics Export
- [ ] Navigate to /dashboard/analytics
- [ ] Test CSV export
- [ ] Test Excel export
- [ ] Test PDF export
- [ ] Test JSON export
- [ ] Verify file downloads

### SEO
- [ ] Visit /sitemap.xml
- [ ] Visit /robots.txt
- [ ] Check page source for meta tags
- [ ] Verify Open Graph tags
- [ ] Check structured data

### Accessibility
- [ ] Tab through navigation
- [ ] Use Skip to Main Content
- [ ] Test with screen reader
- [ ] Check ARIA labels
- [ ] Verify keyboard shortcuts

### Performance
- [ ] Check bundle size
- [ ] Test lazy loading
- [ ] Verify code splitting
- [ ] Monitor Web Vitals

## 🐛 Troubleshooting

### WebSocket Connection Issues
```bash
# Check if port is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Restart WebSocket server
npm run ws:dev
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Export Not Working
- Check if `jspdf` is installed: `npm install jspdf jspdf-autotable`
- Verify data format matches expected structure
- Check browser console for errors

## 📚 Additional Resources

- [PHASE_1_ENHANCEMENTS_COMPLETE.md](./PHASE_1_ENHANCEMENTS_COMPLETE.md) - Full documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)

## 💡 Best Practices

1. **Always use skeleton screens** instead of spinners for better UX
2. **Implement error boundaries** around critical components
3. **Add empty states** for better first-time user experience
4. **Export data** in multiple formats for flexibility
5. **Optimize images** and use lazy loading
6. **Test with keyboard** and screen readers
7. **Monitor performance** regularly with Web Vitals
8. **Keep accessibility** in mind for all new features

---

**Quick Start:**
```bash
# 1. Start WebSocket server
npm run ws:dev

# 2. In another terminal, start Next.js
npm run dev

# 3. Visit http://localhost:9004
# 4. Explore all new enhancements!
```

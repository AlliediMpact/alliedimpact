# Component Showcase - P2P & AI Systems

## 🎨 Component Library Overview

This document showcases all reusable components with their props and usage examples.

---

## Part A: P2P Components

### 1. OfferCard
**Purpose**: Display trading offer in marketplace

**Props**:
```tsx
interface OfferCardProps {
  offer: P2POffer;           // Complete offer object
  onAction: (offerId: string) => void;  // Click handler
  actionLabel?: string;      // Button text (default: "Buy/Sell")
}
```

**Visual Features**:
- Seller avatar with fallback
- Verification badge (3 levels)
- Star rating + total trades
- Asset icon + amount
- Price display (fixed or floating)
- Payment method chips
- Terms preview (2 lines)
- Hover scale animation

**Usage**:
```tsx
<OfferCard
  offer={mockOffers[0]}
  onAction={(id) => router.push(`/p2p/offer/${id}`)}
  actionLabel="View Details"
/>
```

---

### 2. OfferFilterPanel
**Purpose**: Advanced filtering for marketplace

**Props**:
```tsx
interface OfferFilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  searchQuery: string;
  selectedAsset: AssetType | 'all';
  selectedPaymentMethods: PaymentMethod[];
  minAmount: string;
  maxAmount: string;
  priceType: 'all' | 'fixed' | 'floating';
  verificationLevel: 'all' | 'basic' | 'verified' | 'premium';
}
```

**Visual Features**:
- Search input with icon
- Collapsible filter panel
- Asset selection buttons
- Payment method multi-select
- Amount range inputs (min/max)
- Price type toggle
- Verification level buttons
- Active filter count badge
- Clear all button

**Usage**:
```tsx
const [filters, setFilters] = useState<FilterState>({
  searchQuery: '',
  selectedAsset: 'all',
  selectedPaymentMethods: [],
  minAmount: '',
  maxAmount: '',
  priceType: 'all',
  verificationLevel: 'all',
});

<OfferFilterPanel filters={filters} onFilterChange={setFilters} />
```

---

### 3. UserMiniProfile
**Purpose**: Compact user display with stats

**Props**:
```tsx
interface UserMiniProfileProps {
  user: P2POffer['seller'];  // User object with stats
  showStats?: boolean;       // Show rating/trades (default: true)
}
```

**Visual Features**:
- Avatar (image or initials)
- Username
- Verification badge
- Star rating (optional)
- Total trades (optional)
- Completion rate (optional)

**Usage**:
```tsx
<UserMiniProfile user={offer.seller} showStats={true} />
```

---

### 4. OrderStatusBadge
**Purpose**: Visual order status indicator

**Props**:
```tsx
interface OrderStatusBadgeProps {
  status: OrderStatus;  // pending | payment-pending | completed | cancelled | disputed
  size?: 'sm' | 'md' | 'lg';  // default: 'md'
}
```

**Visual Features**:
- 5 status types with unique colors
- Icon for each status
- Color-coded backgrounds
- Fade-in animation

**Status Colors**:
- `pending`: Yellow (Clock icon)
- `payment-pending`: Orange (Package icon)
- `completed`: Green (CheckCircle icon)
- `cancelled`: Gray (XCircle icon)
- `disputed`: Red (AlertTriangle icon)

**Usage**:
```tsx
<OrderStatusBadge status="payment-pending" size="md" />
```

---

### 5. PaymentMethodTag
**Purpose**: Display payment method chip

**Props**:
```tsx
interface PaymentMethodTagProps {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';  // default: 'md'
}
```

**Visual Features**:
- Payment method icon
- Method name
- Consistent slate background
- Three size variants

**Usage**:
```tsx
<PaymentMethodTag method="Bank Transfer" size="md" />
```

---

### 6. EmptyState
**Purpose**: No data placeholder with action

**Props**:
```tsx
interface EmptyStateProps {
  icon?: 'package' | 'search' | 'trending';  // default: 'package'
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Visual Features**:
- Large icon in circle
- Title and description
- Optional action button
- Center-aligned layout
- Fade-in animation

**Usage**:
```tsx
<EmptyState
  icon="search"
  title="No offers found"
  description="Try adjusting your filters"
  action={{
    label: 'Clear Filters',
    onClick: clearFilters,
  }}
/>
```

---

### 7. CountdownTimer
**Purpose**: Payment deadline countdown

**Props**:
```tsx
interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
}
```

**Visual Features**:
- Real-time MM:SS countdown
- Clock icon
- Color change when <5 min (yellow → red)
- Pulse animation when urgent
- "Time Expired" state

**Usage**:
```tsx
<CountdownTimer
  deadline={new Date(Date.now() + 1800000)}  // 30 min from now
  onExpire={() => alert('Time expired!')}
/>
```

---

## Part B: AI Components

### 1. AssetPredictionCard
**Purpose**: Display asset with AI prediction

**Props**:
```tsx
interface AssetPredictionCardProps {
  asset: AIAsset;
  onViewDetails: (assetId: string) => void;
}
```

**Visual Features**:
- Asset icon + name
- Current price (large)
- 24h change with trend arrow
- Prediction badge (Bullish/Bearish/Neutral)
- Confidence percentage
- 24h target price
- Key factors preview (2 items)
- "View Analysis" button
- Trending badge (conditional)
- Hover scale + slide animation

**Usage**:
```tsx
<AssetPredictionCard
  asset={mockAIAssets[0]}
  onViewDetails={(id) => router.push(`/ai/asset/${id}`)}
/>
```

---

### 2. AlertCard
**Purpose**: Display safety/system alert

**Props**:
```tsx
interface AlertCardProps {
  alert: AIAlert;
  onDismiss?: (alertId: string) => void;
}
```

**Visual Features**:
- 4 alert types (warning, danger, info, success)
- Type-specific icon and colors
- Title + message
- Asset name (optional)
- Risk level badge (optional)
- Timestamp
- Dismiss button (optional)
- Read/unread opacity
- Slide-in animation

**Alert Types**:
- `warning`: Yellow (AlertTriangle)
- `danger`: Red (XCircle)
- `info`: Blue (Info)
- `success`: Green (CheckCircle)

**Usage**:
```tsx
<AlertCard
  alert={mockAIAlerts[0]}
  onDismiss={(id) => markAsRead(id)}
/>
```

---

### 3. RiskScoreBadge
**Purpose**: Animated risk score display

**Props**:
```tsx
interface RiskScoreBadgeProps {
  score: number;        // 0-100
  level: RiskLevel;     // low | medium | high | extreme
  size?: 'sm' | 'md' | 'lg';  // default: 'md'
  showLabel?: boolean;  // default: true
}
```

**Visual Features**:
- Circular badge
- Score number (0-100)
- Animated fill based on score
- Risk level label below
- Color-coded (green/yellow/orange/red)
- Spin-in animation
- Fill animation with easing

**Risk Colors**:
- `low` (<30): Green
- `medium` (30-49): Yellow
- `high` (50-74): Orange
- `extreme` (75+): Red

**Usage**:
```tsx
<RiskScoreBadge
  score={35}
  level="low"
  size="lg"
  showLabel={true}
/>
```

---

### 4. SentimentMeter
**Purpose**: Market sentiment bar

**Props**:
```tsx
interface SentimentMeterProps {
  score: number;  // -100 to 100
  size?: 'sm' | 'md' | 'lg';  // default: 'md'
}
```

**Visual Features**:
- Horizontal gradient bar
- Animated fill indicator
- Trend icon (TrendingUp/Down/Activity)
- Sentiment label (Very Positive → Very Negative)
- Score number display
- Color transitions (red to green)
- Pulse animation on fill
- Center marker line

**Sentiment Ranges**:
- `Very Positive`: >40 (Green)
- `Positive`: 10-40 (Light Green)
- `Neutral`: -10 to 10 (Gray)
- `Negative`: -40 to -10 (Light Red)
- `Very Negative`: <-40 (Red)

**Usage**:
```tsx
<SentimentMeter score={72} size="md" />
```

---

## 🎨 Component Styling Patterns

### Color System
```tsx
// Backgrounds
bg-[#0A0F1E]  // Page background
bg-[#1E293B]  // Card/surface
bg-[#2A3B5B]  // Hover state

// Borders
border-[#1E293B]  // Default
border-[#193281]  // Hover/focus

// Primary gradient
from-[#193281] to-[#2563EB]  // Buttons
from-green-600 to-green-500  // Buy/success
from-red-600 to-red-500      // Sell/danger
```

### Animation Patterns
```tsx
// Hover scale
whileHover={{ scale: 1.02, y: -4 }}

// Tap feedback
whileTap={{ scale: 0.98 }}

// Fade in
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Slide in
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
```

### Spacing Scale
```
p-4   // 1rem (16px) - small padding
p-6   // 1.5rem (24px) - medium padding
gap-4 // 1rem - grid gap
gap-6 // 1.5rem - larger gap
mb-8  // 2rem - section margin
```

---

## 📐 Layout Patterns

### Two-Column Layout (Desktop)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar */}
  </div>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} />
  ))}
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map(stat => (
    <StatCard key={stat.label} {...stat} />
  ))}
</div>
```

---

## 🔧 Common Prop Patterns

### Click Handlers
```tsx
onAction: (id: string) => void;
onClick: () => void;
onDismiss: (id: string) => void;
onExpire: () => void;
```

### Size Variants
```tsx
size?: 'sm' | 'md' | 'lg';  // Always optional, default 'md'
```

### Optional Display
```tsx
showLabel?: boolean;   // default: true
showStats?: boolean;   // default: true
```

### Type Enums
```tsx
type: 'buy' | 'sell';
status: 'pending' | 'payment-pending' | 'completed' | ...;
level: 'low' | 'medium' | 'high' | 'extreme';
```

---

## 🎭 Animation Guidelines

### Import Animations
```tsx
import { pageTransition, fadeIn, staggerContainer } from '@/lib/animations';
```

### Page Wrapper
```tsx
<motion.div variants={pageTransition} initial="initial" animate="animate">
  {/* Page content */}
</motion.div>
```

### Individual Elements
```tsx
<motion.div variants={fadeIn}>
  {/* Element */}
</motion.div>
```

### Staggered Lists
```tsx
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item, index) => (
    <motion.div variants={fadeIn} custom={index} key={item.id}>
      {/* Item */}
    </motion.div>
  ))}
</motion.div>
```

---

## 📱 Responsive Utilities

### Show/Hide by Breakpoint
```tsx
className="hidden md:block"        // Show on tablet+
className="block md:hidden"        // Show on mobile only
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"  // Responsive grid
```

### Text Truncation
```tsx
className="line-clamp-1"  // Single line
className="line-clamp-2"  // Two lines
className="truncate"      // Ellipsis overflow
```

---

## ✨ Best Practices

### Component Organization
1. Props interface at top
2. State declarations
3. Event handlers
4. Render logic
5. Return JSX

### Naming Conventions
- Props: `camelCase`
- Components: `PascalCase`
- Files: `PascalCase.tsx`
- Handlers: `handleXxx`

### TypeScript
- Always type props
- Use enums for fixed values
- Export interfaces from mock data files
- Use `Pick` and `Omit` for derived types

### Performance
- Use `whileHover` for hover states (GPU)
- Avoid inline function definitions
- Memoize expensive calculations
- Use `key` prop in lists

---

## 📚 Component Dependencies

### All Components Use
- `framer-motion` - Animations
- `lucide-react` - Icons
- Tailwind CSS - Styling
- TypeScript - Type safety

### P2P Components Import
- Mock data from `@/lib/p2p-mock-data`
- Animations from `@/lib/animations`

### AI Components Import
- Mock data from `@/lib/ai-mock-data`
- Animations from `@/lib/animations`

---

## 🔗 Component Relationships

```
Marketplace Page
├── OfferFilterPanel
└── OfferCard (multiple)
    └── UserMiniProfile
    └── PaymentMethodTag (multiple)

Offer Detail Page
├── UserMiniProfile
├── PaymentMethodTag (multiple)
└── AnimatedInput (from existing lib)

Order Chat Page
├── CountdownTimer
├── OrderStatusBadge
├── UserMiniProfile
└── PaymentMethodTag

Dashboard Page
├── OrderStatusBadge (multiple)
├── PaymentMethodTag (multiple)
└── EmptyState

AI Predict Page
├── AssetPredictionCard (multiple)
└── AlertCard (multiple)

AI Asset Detail Page
├── RiskScoreBadge
└── SentimentMeter
```

---

**Component Library Version**: 1.0.0
**Total Components**: 11 (7 P2P + 4 AI)
**Total Props Types**: 20+
**Animation Variants**: 5+

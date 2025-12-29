/**
 * Lazy Loading Configuration
 * Central place to manage all dynamic imports for code splitting
 */

import dynamic from 'next/dynamic';
import { SkeletonCard, SkeletonDashboard } from '@/components/ui/skeleton-card';

// Admin Components - Only load when needed
export const AdminDashboard = dynamic(
  () => import('@/app/dashboard/admin/page'),
  {
    loading: () => <SkeletonDashboard />,
    ssr: false,
  }
);

export const AdvancedAnalyticsDashboard = dynamic(
  () => import('@/components/AdvancedAnalyticsDashboard'),
  {
    loading: () => <SkeletonDashboard />,
    ssr: false,
  }
);

// Transaction Components
export const TransactionHistory = dynamic(
  () => import('@/components/TransactionHistory'),
  {
    loading: () => <SkeletonCard />,
  }
);

export const LiveTransactionFeed = dynamic(
  () => import('@/components/live-transaction-feed').then(mod => ({ default: mod.LiveTransactionFeed })),
  {
    loading: () => <SkeletonCard />,
    ssr: false,
  }
);

// Chart Components - Heavy libraries
export const ChartComponents = {
  LineChart: dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false }),
  BarChart: dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false }),
  PieChart: dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false }),
  AreaChart: dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false }),
};

// Trading Components
export const P2PTradingDashboard = dynamic(
  () => import('@/components/P2PTradingDashboard'),
  {
    loading: () => <SkeletonDashboard />,
    ssr: false,
  }
);

// Onboarding Components
export const UserOnboarding = dynamic(
  () => import('@/components/onboarding/UserOnboarding'),
  {
    ssr: false,
  }
);

// Modal/Dialog Components - Load on interaction
export const InvestmentModal = dynamic(
  () => import('@/components/modals/InvestmentModal'),
  {
    ssr: false,
  }
);

export const LoanApplicationModal = dynamic(
  () => import('@/components/modals/LoanApplicationModal'),
  {
    ssr: false,
  }
);

export const WithdrawalModal = dynamic(
  () => import('@/components/modals/WithdrawalModal'),
  {
    ssr: false,
  }
);

// Settings Components
export const ProfileSettings = dynamic(
  () => import('@/components/settings/ProfileSettings'),
  {
    loading: () => <SkeletonCard />,
  }
);

export const SecuritySettings = dynamic(
  () => import('@/components/settings/SecuritySettings'),
  {
    loading: () => <SkeletonCard />,
  }
);

// Help & Support
export const HelpCenter = dynamic(
  () => import('@/components/HelpCenter'),
  {
    loading: () => <SkeletonCard />,
  }
);

export const TicketSystem = dynamic(
  () => import('@/components/TicketSystem'),
  {
    loading: () => <SkeletonCard />,
  }
);

// Notification Components
export const NotificationCenter = dynamic(
  () => import('@/components/NotificationCenter'),
  {
    ssr: false,
  }
);

// Referral Components
export const ReferralDashboard = dynamic(
  () => import('@/components/ReferralDashboard'),
  {
    loading: () => <SkeletonCard />,
  }
);

// Report Components
export const ReportGenerator = dynamic(
  () => import('@/components/ReportGenerator'),
  {
    loading: () => <SkeletonCard />,
    ssr: false,
  }
);

// PDF Export - Heavy library
export const PDFExport = dynamic(
  () => import('jspdf').then(() => import('@/components/export-button')),
  {
    ssr: false,
  }
);

/**
 * Preload critical components
 * Call this function when you know a component will be needed soon
 */
export function preloadComponent(componentName: keyof typeof componentPreloaders) {
  const preloader = componentPreloaders[componentName];
  if (preloader) {
    preloader();
  }
}

const componentPreloaders = {
  AdvancedAnalyticsDashboard: () => AdvancedAnalyticsDashboard.preload(),
  P2PTradingDashboard: () => P2PTradingDashboard.preload(),
  TransactionHistory: () => TransactionHistory.preload(),
  LiveTransactionFeed: () => LiveTransactionFeed.preload(),
};

/**
 * Route-based code splitting configuration
 */
export const routeComponents = {
  '/dashboard': ['TransactionHistory', 'LiveTransactionFeed'],
  '/dashboard/analytics': ['AdvancedAnalyticsDashboard'],
  '/dashboard/trading': ['P2PTradingDashboard'],
  '/dashboard/admin': ['AdminDashboard', 'AdvancedAnalyticsDashboard'],
  '/dashboard/referrals': ['ReferralDashboard'],
  '/dashboard/support': ['HelpCenter', 'TicketSystem'],
};

/**
 * Preload components for a route
 */
export function preloadRouteComponents(route: string) {
  const components = routeComponents[route as keyof typeof routeComponents];
  if (components) {
    components.forEach((component) => {
      preloadComponent(component as keyof typeof componentPreloaders);
    });
  }
}

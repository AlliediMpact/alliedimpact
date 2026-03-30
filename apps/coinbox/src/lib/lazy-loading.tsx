/**
 * Lazy Loading Configuration
 * Central place to manage all dynamic imports for code splitting
 */

import dynamic from 'next/dynamic';
import { SkeletonCard, SkeletonDashboard } from '@/components/ui/skeleton-card';

// Admin Components - Only load when needed
export const AdminDashboard = dynamic(
  // @ts-ignore - Admin dashboard may not exist in all builds
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
  // @ts-ignore - TransactionHistory component may not exist
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
  // Chart components from recharts library
  // Dynamically loaded to reduce initial bundle size
};

// Trading Components
export const P2PTradingDashboard = dynamic(
  // @ts-ignore - P2PTradingDashboard component may not exist
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
// Components commented out as they don't exist yet
// export const InvestmentModal = dynamic(
//   () => import('@/components/modals/InvestmentModal'),
//   {
//     ssr: false,
//   }
// );

// export const LoanApplicationModal = dynamic(
//   () => import('@/components/modals/LoanApplicationModal'),
//   {
//     ssr: false,
//   }
// );

// export const WithdrawalModal = dynamic(
//   () => import('@/components/modals/WithdrawalModal'),
//   {
//     ssr: false,
//   }
// );

// Settings Components - Components commented out as they don't exist yet
// export const ProfileSettings = dynamic(
//   () => import('@/components/settings/ProfileSettings'),
//   {
//     loading: () => <SkeletonCard />,
//   }
// );

// export const SecuritySettings = dynamic(
//   () => import('@/components/settings/SecuritySettings'),
//   {
//     loading: () => <SkeletonCard />,
//   }
// );

// Help & Support - Components commented out as they don't exist yet
// export const HelpCenter = dynamic(
//   () => import('@/components/HelpCenter'),
//   {
//     loading: () => <SkeletonCard />,
//   }
// );

// export const TicketSystem = dynamic(
//   () => import('@/components/TicketSystem'),
//   {
//     loading: () => <SkeletonCard />,
//   }
// );

// Notification Components - Components commented out as they don't exist yet
// export const NotificationCenter = dynamic(
//   () => import('@/components/NotificationCenter'),
//   {
//     ssr: false,
//   }
// );

// Referral Components - Components commented out as they don't exist yet
// export const ReferralDashboard = dynamic(
//   () => import('@/components/ReferralDashboard'),
//   {
//     loading: () => <SkeletonCard />,
//   }
// );

// Report Components - Components commented out as they don't exist yet
// export const ReportGenerator = dynamic(
//   () => import('@/components/ReportGenerator'),
//   {
//     loading: () => <SkeletonCard />,
//     ssr: false,
//   }
// );

// PDF Export - Heavy library (commented out due to dependency issues)
// export const PDFExport = dynamic(
//   () => import('@/components/export-button'),
//   {
//     ssr: false,
//   }
// );

/**
 * Preload critical components
 * Call this function when you know a component will be needed soon
 * NOTE: Next.js 14 dynamic() does not support .preload() method
 */
export function preloadComponent(componentName: string) {
  // Preloading is handled automatically by Next.js when components are imported
  // This function is a no-op but maintained for API compatibility
  console.debug(`Component preload requested for: ${componentName}`);
}

// Preloaders object is empty since Next.js 14 handles preloading automatically
const componentPreloaders: Record<string, () => void> = {};

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

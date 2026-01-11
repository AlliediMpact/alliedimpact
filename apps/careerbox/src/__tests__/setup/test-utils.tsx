import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that wraps components with providers
 * Add any global providers here (e.g., ThemeProvider, QueryClientProvider)
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock data factories for testing
 */

export const mockJob = (overrides = {}) => ({
  id: 'job-1',
  title: 'Software Engineer',
  company: {
    name: 'Tech Corp',
    logo: '/logo.png',
    location: 'Johannesburg, GP',
  },
  type: 'Full-time' as const,
  location: 'Johannesburg, GP',
  salary: {
    min: 50000,
    max: 70000,
    currency: 'ZAR',
  },
  postedDate: '2026-01-10',
  description: 'We are looking for a talented software engineer...',
  skills: ['React', 'TypeScript', 'Node.js'],
  isSaved: false,
  ...overrides,
});

export const mockApplication = (overrides = {}) => ({
  id: 'app-1',
  listingId: 'job-1',
  status: 'pending' as const,
  appliedDate: '2026-01-10',
  coverLetter: 'I am interested in this position...',
  resumeUrl: '/resumes/resume.pdf',
  ...overrides,
});

export const mockNotification = (overrides = {}) => ({
  id: 'notif-1',
  type: 'application' as const,
  title: 'Application Update',
  description: 'Your application has been reviewed',
  timestamp: '2026-01-10T10:00:00Z',
  read: false,
  ...overrides,
});

export const mockReview = (overrides = {}) => ({
  id: 'review-1',
  author: 'John Doe',
  position: 'Software Engineer',
  rating: 4,
  date: '2026-01-05',
  title: 'Great place to work',
  pros: 'Good culture',
  cons: 'Fast paced',
  helpful: 10,
  notHelpful: 2,
  ...overrides,
});

/**
 * Utility to wait for async operations
 */
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 100));
};

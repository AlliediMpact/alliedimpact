import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
jest.mock('@/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DashboardPage', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard with user information', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as any,
      platformUser: {
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        emailVerified: true,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('should display fallback name when displayName is not available', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: null,
      } as any,
      platformUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText(/welcome back, user/i)).toBeInTheDocument();
  });

  it('should render all product cards', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as any,
      platformUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText('Coin Box')).toBeInTheDocument();
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('uMkhanyakude')).toBeInTheDocument();
    expect(screen.getByText('Drive Master')).toBeInTheDocument();
    expect(screen.getByText('Code Tech')).toBeInTheDocument();
    expect(screen.getByText('Cup Final')).toBeInTheDocument();
  });

  it('should show active status for available products', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as any,
      platformUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<DashboardPage />);

    const activeStatuses = screen.getAllByText(/active/i);
    expect(activeStatuses.length).toBeGreaterThan(0);
  });

  it('should show coming soon status for unavailable products', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as any,
      platformUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<DashboardPage />);

    const comingSoonStatuses = screen.getAllByText(/coming soon/i);
    expect(comingSoonStatuses.length).toBeGreaterThan(0);
  });
});

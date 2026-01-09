import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

jest.mock('@/hooks/useAuth');
jest.mock('next/navigation');

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    } as any);
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('should show loading spinner while checking auth', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      platformUser: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
      } as any,
      loading: false,
      platformUser: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      platformUser: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2Fdashboard');
    });
  });

  it('should not render children during redirect', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      platformUser: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      refreshUser: jest.fn(),
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});

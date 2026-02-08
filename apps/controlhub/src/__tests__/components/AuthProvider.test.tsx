import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock Firebase auth
const mockOnAuthStateChanged = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetIdTokenResult = jest.fn();

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  onAuthStateChanged: (auth: any, callback: any) => mockOnAuthStateChanged(auth, callback),
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  getIdTokenResult: mockGetIdTokenResult,
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, role, signIn, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="role">{role || 'No role'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthProvider', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // No user initially
      return jest.fn(); // unsubscribe function
    });
  });

  it('should render children', () => {
    render(
      <AuthProvider>
        <div>Test content</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Don't call callback immediately
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should set user when authenticated', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    mockGetIdTokenResult.mockResolvedValue({
      claims: { controlhub_admin: true, mfa_enabled: true },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('should extract role from token claims', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    mockGetIdTokenResult.mockResolvedValue({
      claims: { controlhub_viewer: true, mfa_enabled: true },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role')).toHaveTextContent('controlhub_viewer');
    });
  });

  it('should warn when MFA is not enabled', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    mockGetIdTokenResult.mockResolvedValue({
      claims: { controlhub_admin: true },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('MFA not enabled for user');
    });

    consoleWarnSpy.mockRestore();
  });

  it('should handle sign in', async () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    signInButton.click();

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password'
      );
    });
  });

  it('should handle sign out and redirect', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    mockGetIdTokenResult.mockResolvedValue({
      claims: { controlhub_admin: true, mfa_enabled: true },
    });

    mockSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    const signOutButton = screen.getByText('Sign Out');
    signOutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console errors for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleErrorSpy.mockRestore();
  });
});

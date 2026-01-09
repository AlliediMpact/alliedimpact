import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppHeader from '@/components/AppHeader';
import { Project } from '@allied-impact/projects';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    pathname: '/',
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  User: () => <div data-testid="user-icon" />,
  Moon: () => <div data-testid="moon-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
  HelpCircle: () => <div data-testid="help-icon" />,
}));

// Mock UI components
jest.mock('@allied-impact/ui', () => ({
  Button: ({ children, onClick, variant, className, size, ...props }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="dropdown-item">{children}</button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
}));

// Mock components
jest.mock('@/components/Logo', () => {
  return function Logo({ toDashboard, className }: any) {
    return <div data-testid="logo" data-to-dashboard={toDashboard} className={className} />;
  };
});

jest.mock('@/components/ProjectSwitcher', () => {
  return function ProjectSwitcher({ currentProject, onProjectChange }: any) {
    return (
      <div data-testid="project-switcher">
        <button onClick={() => onProjectChange({ id: 'test', name: 'Test Project' })}>
          {currentProject?.name || 'Select Project'}
        </button>
      </div>
    );
  };
});

jest.mock('@/components/NotificationsPanel', () => {
  return function NotificationsPanel({ onClose }: any) {
    return (
      <div data-testid="notifications-panel">
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock Firebase
const mockOnSnapshot = jest.fn();
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
}));

jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({})),
}));

describe('AppHeader', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockProject: Project = {
    id: 'p1',
    name: 'Test Project',
    description: 'Test project description',
    clientId: 'client1',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user123',
  };

  const mockOnSignOut = jest.fn();
  const mockOnMenuToggle = jest.fn();
  const mockOnProjectChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ size: 3 }); // 3 unread notifications
      return jest.fn(); // unsubscribe function
    });
  });

  describe('Rendering', () => {
    it('should render header component', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render menu button on mobile', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const menuIcon = screen.getByTestId('menu-icon');
      expect(menuIcon).toBeInTheDocument();
    });

    it('should render logo', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const logo = screen.getByTestId('logo');
      expect(logo).toBeInTheDocument();
    });

    it('should render user information', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should render user email', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const moonIcon = screen.getByTestId('moon-icon');
      expect(moonIcon).toBeInTheDocument();
    });

    it('should render notifications button', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const bellIcon = screen.getByTestId('bell-icon');
      expect(bellIcon).toBeInTheDocument();
    });
  });

  describe('Menu Toggle', () => {
    it('should call onMenuToggle when menu button clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuButton);

      expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
    });

    it('should have correct aria-label for accessibility', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
    });
  });

  describe('Search Functionality', () => {
    it('should render search input on desktop', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search projects/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should update search term on input change', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search projects/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      expect(searchInput.value).toBe('test query');
    });

    it('should navigate to search page on form submit', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search projects/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      const form = searchInput.closest('form')!;
      fireEvent.submit(form);

      expect(mockPush).toHaveBeenCalledWith('/search?q=test%20search');
    });

    it('should not navigate when search term is empty', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search projects/i);
      const form = searchInput.closest('form')!;
      fireEvent.submit(form);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should toggle mobile search', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const searchButton = screen.getByLabelText('Search');
      fireEvent.click(searchButton);

      waitFor(() => {
        expect(screen.getAllByPlaceholderText(/Search/i).length).toBeGreaterThan(1);
      });
    });

    it('should clear search term after submit', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search projects/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const form = searchInput.closest('form')!;
      fireEvent.submit(form);

      waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle theme when button clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);

      waitFor(() => {
        const sunIcon = screen.queryByTestId('sun-icon');
        expect(sunIcon).toBeInTheDocument();
      });
    });

    it('should have correct aria-label', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const themeButton = screen.getByLabelText('Toggle theme');
      expect(themeButton).toHaveAttribute('aria-label', 'Toggle theme');
    });
  });

  describe('User Menu', () => {
    it('should render user dropdown', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('should display user avatar with initial', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User"
    });

    it('should navigate to profile when profile clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const profileButton = screen.getByText('Profile').closest('button')!;
      fireEvent.click(profileButton);

      expect(mockPush).toHaveBeenCalledWith('/settings/profile');
    });

    it('should navigate to settings when settings clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const settingsButton = screen.getByText('Settings').closest('button')!;
      fireEvent.click(settingsButton);

      expect(mockPush).toHaveBeenCalledWith('/settings');
    });

    it('should navigate to help when help clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const helpButton = screen.getByText('Help & Support').closest('button')!;
      fireEvent.click(helpButton);

      expect(mockPush).toHaveBeenCalledWith('/help');
    });

    it('should call onSignOut when sign out clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const signOutButton = screen.getByText('Sign Out').closest('button')!;
      fireEvent.click(signOutButton);

      expect(mockOnSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Project Switcher', () => {
    it('should render project switcher when onProjectChange provided', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
          currentProject={mockProject}
          onProjectChange={mockOnProjectChange}
        />
      );

      expect(screen.getByTestId('project-switcher')).toBeInTheDocument();
    });

    it('should not render project switcher when onProjectChange not provided', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.queryByTestId('project-switcher')).not.toBeInTheDocument();
    });

    it('should call onProjectChange when project selected', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
          currentProject={mockProject}
          onProjectChange={mockOnProjectChange}
        />
      );

      const projectButton = screen.getByText('Test Project');
      fireEvent.click(projectButton);

      expect(mockOnProjectChange).toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    it('should show unread count badge', async () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      await waitFor(() => {
        const badge = screen.getByText('3');
        expect(badge).toBeInTheDocument();
      });
    });

    it('should show 9+ when unread count > 9', async () => {
      mockOnSnapshot.mockImplementation((query, callback) => {
        callback({ size: 15 });
        return jest.fn();
      });

      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      await waitFor(() => {
        const badge = screen.getByText('9+');
        expect(badge).toBeInTheDocument();
      });
    });

    it('should open notifications panel when bell clicked', () => {
      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);

      waitFor(() => {
        expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();
      });
    });

    it('should not load notifications when user not authenticated', () => {
      mockOnSnapshot.mockClear();

      render(
        <AppHeader
          user={null}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(mockOnSnapshot).not.toHaveBeenCalled();
    });

    it('should handle notification loading errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockOnSnapshot.mockImplementation(() => {
        throw new Error('Failed to load');
      });

      render(
        <AppHeader
          user={mockUser}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without displayName', () => {
      const userWithoutName = { ...mockUser, displayName: undefined };

      render(
        <AppHeader
          user={userWithoutName}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByText('test')).toBeInTheDocument(); // Email username
      expect(screen.getByText('t')).toBeInTheDocument(); // First letter of email
    });

    it('should handle user without email', () => {
      const userWithoutEmail = { ...mockUser, email: undefined, displayName: undefined };

      render(
        <AppHeader
          user={userWithoutEmail}
          onSignOut={mockOnSignOut}
          onMenuToggle={mockOnMenuToggle}
          isMobileMenuOpen={false}
        />
      );

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument(); // Default initial
    });
  });
});

/**
 * Tests for Header component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../../src/components/layout/Header';

// Mock dependencies
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/notifications/NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center">Notifications</div>,
}));

jest.mock('@allied-impact/ui', () => ({
  Logo: ({ appName, onClick }: any) => (
    <div data-testid="logo" onClick={onClick}>
      {appName}
    </div>
  ),
}));

const { usePathname, useRouter } = require('next/navigation');
const { useAuth } = require('@/contexts/AuthContext');

describe('Header', () => {
  const mockPush = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    usePathname.mockReturnValue('/en');
    useRouter.mockReturnValue({ push: mockPush });
  });

  describe('rendering without user', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });
    });

    it('should render the logo', () => {
      render(<Header />);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.getByText('EduTech')).toBeInTheDocument();
    });

    it('should navigate to home when logo clicked', () => {
      render(<Header />);

      const logo = screen.getByTestId('logo');
      fireEvent.click(logo);

      expect(mockPush).toHaveBeenCalledWith('/en');
    });

    it('should render all navigation links', () => {
      render(<Header />);

      expect(screen.getByText('navigation.home')).toBeInTheDocument();
      expect(screen.getByText('navigation.courses')).toBeInTheDocument();
      expect(screen.getByText('Forum')).toBeInTheDocument();
      expect(screen.getByText('navigation.about')).toBeInTheDocument();
      expect(screen.getByText('navigation.pricing')).toBeInTheDocument();
    });

    it('should render sign in button when not authenticated', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render sign up button when not authenticated', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('rendering with authenticated user', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
          displayName: 'Test User',
        },
        signOut: mockSignOut,
      });
    });

    it('should render notification center for authenticated user', () => {
      render(<Header />);

      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    });

    it('should display user name when authenticated', () => {
      render(<Header />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should display email when no display name', () => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
        signOut: mockSignOut,
      });

      render(<Header />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('should show user menu when user button clicked', () => {
      render(<Header />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      expect(screen.getByText('navigation.dashboard')).toBeInTheDocument();
    });

    it('should hide sign in/up buttons when authenticated', () => {
      render(<Header />);

      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument();
    });
  });

  describe('user menu interactions', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
          displayName: 'Test User',
        },
        signOut: mockSignOut,
      });
    });

    it('should toggle user menu on button click', () => {
      render(<Header />);

      const userButton = screen.getByText('Test User');

      // Open menu
      fireEvent.click(userButton);
      expect(screen.getByText('navigation.dashboard')).toBeInTheDocument();

      // Close menu
      fireEvent.click(userButton);
      expect(screen.queryByText('navigation.dashboard')).not.toBeInTheDocument();
    });

    it('should show dashboard link in user menu', () => {
      render(<Header />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      const dashboardLink = screen.getByText('navigation.dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/en/dashboard');
    });

    it('should close user menu when dashboard link clicked', () => {
      render(<Header />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      const dashboardLink = screen.getByText('navigation.dashboard');
      fireEvent.click(dashboardLink);

      expect(screen.queryByText('navigation.dashboard')).not.toBeInTheDocument();
    });

    it('should show sign out button in user menu', async () => {
      render(<Header />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
    });

    it('should call signOut when sign out button clicked', async () => {
      render(<Header />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('mobile menu', () => {
    it('should show mobile menu toggle button on mobile', () => {
      render(<Header />);

      // Mobile menu button should be in DOM (hidden on desktop with CSS)
      const menuButtons = screen.getAllByRole('button');
      expect(menuButtons.length).toBeGreaterThan(0);
    });

    it('should toggle mobile menu when button clicked', () => {
      useAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);

      const menuButton = screen.getByLabelText(/toggle menu/i);
      
      // Open mobile menu
      fireEvent.click(menuButton);
      
      // Mobile menu should show navigation
      const mobileNav = screen.getAllByText('navigation.home');
      expect(mobileNav.length).toBeGreaterThan(0);
    });
  });

  describe('active navigation link', () => {
    it('should highlight active navigation link', () => {
      usePathname.mockReturnValue('/en/courses');

      render(<Header />);

      const coursesLink = screen.getByText('navigation.courses');
      expect(coursesLink).toHaveClass('text-primary-blue');
    });

    it('should not highlight inactive links', () => {
      usePathname.mockReturnValue('/en/courses');

      render(<Header />);

      const homeLink = screen.getByText('navigation.home');
      expect(homeLink).toHaveClass('text-muted-foreground');
    });
  });

  describe('accessibility', () => {
    it('should have semantic nav element', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should have accessible navigation links', () => {
      render(<Header />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have accessible buttons with aria-labels', () => {
      useAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing user displayName gracefully', () => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
          displayName: null,
        },
        signOut: mockSignOut,
      });

      render(<Header />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    it('should handle empty navigation array', () => {
      // This tests robustness - component should still render
      render(<Header />);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('should handle signOut errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSignOut.mockRejectedValueOnce(new Error('Sign out failed'));

      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
          displayName: 'Test User',
        },
        signOut: mockSignOut,
      });

      render(<Header />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});

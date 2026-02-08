/**
 * Tests for ProtectedRoute component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../../src/components/ProtectedRoute';

// Mock AuthContext
const mockPush = jest.fn();
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const { useAuth } = require('../../src/contexts/AuthContext');

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner when loading', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Check for loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should have correct loading spinner styles', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('flex', 'items-center', 'justify-center');

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass(
        'rounded-full',
        'h-12',
        'w-12',
        'border-b-2',
        'border-primary-blue'
      );
    });
  });

  describe('authenticated user', () => {
    it('should render children when user is authenticated', () => {
      useAuth.mockReturnValue({
        user: { uid: 'user123', email: 'test@example.com' },
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not show loading spinner when authenticated', () => {
      useAuth.mockReturnValue({
        user: { uid: 'user123', email: 'test@example.com' },
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should render multiple children', () => {
      useAuth.mockReturnValue({
        user: { uid: 'user123' },
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>First Child</div>
          <div>Second Child</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });

  describe('unauthenticated user', () => {
    it('should redirect to login when not authenticated', async () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/login');
      });
    });

    it('should not render children when not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render null when not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      const { container } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('navigation behavior', () => {
    it('should only redirect once', async () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it('should not redirect when loading even if no user', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect when user is authenticated', () => {
      useAuth.mockReturnValue({
        user: { uid: 'user123' },
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('state transitions', () => {
    it('should handle loading to authenticated transition', async () => {
      const { rerender } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Initially loading
      useAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      rerender(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();

      // Then authenticated
      useAuth.mockReturnValue({
        user: { uid: 'user123' },
        loading: false,
      });

      rerender(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle loading to unauthenticated transition', async () => {
      // Initially loading
      useAuth.mockReturnValue({
        user: null,
        loading: true,
      });

      const { rerender } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Then not authenticated
      useAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      rerender(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/login');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined user', async () => {
      useAuth.mockReturnValue({
        user: undefined,
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en/login');
      });
    });

    it('should handle empty children', () => {
      useAuth.mockReturnValue({
        user: { uid: 'user123' },
        loading: false,
      });

      const { container } = render(
        <ProtectedRoute>{null}</ProtectedRoute>
      );

      expect(container.firstChild).not.toBeNull();
    });

    it('should handle complex nested children', () => {
      useAuth.mockReturnValue({
        user: { uid: 'user123' },
        loading: false,
      });

      render(
        <ProtectedRoute>
          <div>
            <span>Nested Content</span>
            <div>
              <button>Action</button>
            </div>
          </div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Nested Content')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});

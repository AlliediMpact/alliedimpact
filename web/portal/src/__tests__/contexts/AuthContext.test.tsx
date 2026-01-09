import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { getAuthInstance, getDbInstance } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

jest.mock('@/lib/firebase');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

describe('AuthContext', () => {
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
  };

  const mockDb = {};

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthInstance as jest.Mock).mockReturnValue(mockAuth);
    (getDbInstance as jest.Mock).mockReturnValue(mockDb);
  });

  describe('useAuth hook', () => {
    it('should provide initial auth state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.platformUser).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
    });

    it('should handle sign in errors', async () => {
      const error = new Error('Invalid credentials');
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        result.current.signIn('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: false,
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (updateProfile as jest.Mock).mockResolvedValue(undefined);
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(async () => {
        await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123'
      );
      expect(updateProfile).toHaveBeenCalled();
      expect(sendEmailVerification).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
    });

    it('should handle sign up errors', async () => {
      const error = new Error('Email already in use');
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        result.current.signUp('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com'
      );
    });

    it('should handle reset password errors', async () => {
      const error = new Error('User not found');
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        result.current.resetPassword('nonexistent@example.com')
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockAuth.currentUser = mockUser as any;
      (updateProfile as jest.Mock).mockResolvedValue(undefined);
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: 'Updated Name' }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(async () => {
        await result.current.updateUserProfile({ displayName: 'Updated Name' });
      });

      expect(updateProfile).toHaveBeenCalled();
    });
  });
});

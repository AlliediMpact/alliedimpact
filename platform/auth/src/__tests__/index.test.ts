import { signIn, createPlatformUser, signOut } from '../index'
import * as firebaseAuth from 'firebase/auth'

// Mock Firebase Auth
jest.mock('firebase/auth')

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      const mockUserCredential = {
        user: mockUser,
      }

      const mockSignIn = jest.spyOn(firebaseAuth, 'signInWithEmailAndPassword')
      mockSignIn.mockResolvedValue(mockUserCredential as any)

      const result = await signIn('test@example.com', 'password123')

      expect(result).toEqual(mockUser)
      expect(mockSignIn).toHaveBeenCalled()
    })

    it('should throw error for invalid credentials', async () => {
      const mockSignIn = jest.spyOn(firebaseAuth, 'signInWithEmailAndPassword')
      mockSignIn.mockRejectedValue(new Error('auth/wrong-password'))

      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow()
    })

    it('should throw error for non-existent user', async () => {
      const mockSignIn = jest.spyOn(firebaseAuth, 'signInWithEmailAndPassword')
      mockSignIn.mockRejectedValue(new Error('auth/user-not-found'))

      await expect(signIn('nonexistent@example.com', 'password123')).rejects.toThrow()
    })
  })

  describe('createPlatformUser', () => {
    it('should create new user with valid data', async () => {
      const mockUser = {
        uid: 'user456',
        email: 'newuser@example.com',
        displayName: null,
      }

      const mockUserCredential = {
        user: mockUser,
      }

      const mockCreateUser = jest.spyOn(firebaseAuth, 'createUserWithEmailAndPassword')
      mockCreateUser.mockResolvedValue(mockUserCredential as any)

      const result = await createPlatformUser('newuser@example.com', 'password123')

      expect(result.user).toEqual(mockUser)
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      )
    })

    it('should throw error for existing email', async () => {
      const mockCreateUser = jest.spyOn(firebaseAuth, 'createUserWithEmailAndPassword')
      mockCreateUser.mockRejectedValue(new Error('auth/email-already-in-use'))

      await expect(createPlatformUser('existing@example.com', 'password123')).rejects.toThrow()
    })

    it('should throw error for weak password', async () => {
      const mockCreateUser = jest.spyOn(firebaseAuth, 'createUserWithEmailAndPassword')
      mockCreateUser.mockRejectedValue(new Error('auth/weak-password'))

      await expect(createPlatformUser('newuser@example.com', '123')).rejects.toThrow()
    })
  })

  describe('signOut', () => {
    it('should sign out current user', async () => {
      const mockSignOut = jest.spyOn(firebaseAuth, 'signOut')
      mockSignOut.mockResolvedValue()

      await expect(signOut()).resolves.not.toThrow()
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const mockSignOut = jest.spyOn(firebaseAuth, 'signOut')
      mockSignOut.mockRejectedValue(new Error('Network error'))

      await expect(signOut()).rejects.toThrow()
    })
  })
})

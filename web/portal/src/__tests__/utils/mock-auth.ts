import { User as FirebaseUser } from 'firebase/auth';

export const mockFirebaseUser = (overrides?: Partial<FirebaseUser>): FirebaseUser => ({
  uid: 'test-uid-123',
  email: 'test@example.com',
  emailVerified: true,
  displayName: 'Test User',
  photoURL: null,
  phoneNumber: null,
  isAnonymous: false,
  providerId: 'firebase',
  tenantId: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  ...overrides,
} as any);

export const mockPlatformUser = {
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAuthContext = {
  user: mockFirebaseUser(),
  platformUser: mockPlatformUser,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updateUserProfile: jest.fn(),
  refreshUser: jest.fn(),
};

export const createMockAuthContext = (overrides?: Partial<typeof mockAuthContext>) => ({
  ...mockAuthContext,
  ...overrides,
});

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress console errors in tests (optional, remove if you want to see them)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/dashboard',
  })),
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// Mock Next.js server API
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn((body, init) => {
        const response = new Response(JSON.stringify(body), {
          ...init,
          headers: {
            ...init?.headers,
            'content-type': 'application/json',
          },
        });
        
        Object.defineProperty(response, 'status', {
          get() {
            return init?.status || 200;
          },
        });
        
        return response;
      }),
    },
  };
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id', email: 'test@example.com' },
    onAuthStateChanged: jest.fn(),
  })),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb({ uid: 'test-user-id', email: 'test@example.com' });
    return jest.fn(); // unsubscribe
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: { uid: 'test-user-id', email: 'test@example.com' },
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: { uid: 'test-user-id', email: 'test@example.com' },
  }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      id: 'mock-doc-1',
      createdAt: new Date(),
    }),
    id: 'mock-doc-1',
  }),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: 'mock-doc-1',
        data: () => ({ title: 'Test Alert', severity: 'high' }),
      },
    ],
    forEach: jest.fn(),
    empty: false,
    size: 1,
  }),
  addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  setDoc: jest.fn().mockResolvedValue({}),
  updateDoc: jest.fn().mockResolvedValue({}),
  deleteDoc: jest.fn().mockResolvedValue({}),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
process.env.CONTROLHUB_API_TOKEN = 'test-api-token';

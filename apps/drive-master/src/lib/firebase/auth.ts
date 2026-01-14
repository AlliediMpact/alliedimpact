import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * User profile structure in Firestore
 */
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Subscription
  tier: 'free' | 'trial' | 'paid';
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  subscriptionPurchaseDate: Date | null;
  
  // Progress
  currentStage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  stagesCompleted: string[];
  totalJourneysCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  averageScore: number;
  
  // Gamification
  credits: number;
  badges: any[];
  streak: number;
  lastActiveDate: Date;
  isBankrupt: boolean;
  
  // Anti-abuse
  deviceId: string;
  lastSyncedAt: Date | null;
  flaggedForReview: boolean;
  flagReason: string | null;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update display name
    await updateProfile(userCredential.user, { displayName });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user profile in Firestore
    const userProfile: Omit<UserProfile, 'userId'> = {
      email,
      displayName,
      emailVerified: false,
      phoneVerified: false,
      
      // Free tier by default
      tier: 'free',
      trialStartDate: null,
      trialEndDate: null,
      subscriptionPurchaseDate: null,
      
      // Initial progress
      currentStage: 'beginner',
      stagesCompleted: [],
      totalJourneysCompleted: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      averageScore: 0,
      
      // Initial gamification
      credits: 100, // Starting bonus
      badges: [],
      streak: 0,
      lastActiveDate: new Date(),
      isBankrupt: false,
      
      // Anti-abuse
      deviceId: generateDeviceFingerprint(),
      lastSyncedAt: null,
      flaggedForReview: false,
      flagReason: null,
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(
      doc(db, 'drivemaster_users', userCredential.user.uid),
      {
        ...userProfile,
        userId: userCredential.user.uid,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
        updatedAt: Timestamp.fromDate(userProfile.updatedAt),
        lastActiveDate: Timestamp.fromDate(userProfile.lastActiveDate),
      }
    );

    return userCredential;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign in with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      throw new Error('Please verify your email before signing in');
    }

    return userCredential;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(user: User): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error('Email verification error:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'drivemaster_users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        lastActiveDate: data.lastActiveDate.toDate(),
        trialStartDate: data.trialStartDate?.toDate() || null,
        trialEndDate: data.trialEndDate?.toDate() || null,
        subscriptionPurchaseDate: data.subscriptionPurchaseDate?.toDate() || null,
        lastSyncedAt: data.lastSyncedAt?.toDate() || null,
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Generate device fingerprint for anti-abuse
 */
function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ];

  return btoa(components.join('|'));
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again';
}

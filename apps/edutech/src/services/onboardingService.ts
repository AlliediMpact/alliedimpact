import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { EduTechUser } from '@/types';

export interface OnboardingState {
  userId: string;
  completed: boolean;
  completedSteps: string[];
}

// Lightweight, Firestore-backed onboarding state.
// We keep it generic; UI defines the actual steps.

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  const userRef = doc(db, 'edutech_users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return {
      userId,
      completed: false,
      completedSteps: [],
    };
  }

  const data = snap.data() as EduTechUser;

  return {
    userId,
    completed: Boolean(data.onboardingCompleted),
    completedSteps: data.onboardingStepsCompleted || [],
  };
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  const userRef = doc(db, 'edutech_users', userId);
  await updateDoc(userRef, {
    onboardingCompleted: true,
    updatedAt: serverTimestamp(),
  });
}

export async function completeOnboardingStep(
  userId: string,
  stepId: string,
  totalSteps?: number
): Promise<void> {
  const userRef = doc(db, 'edutech_users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return;
  }

  const data = snap.data() as EduTechUser;
  const existingSteps = new Set(data.onboardingStepsCompleted || []);
  existingSteps.add(stepId);

  const completedSteps = Array.from(existingSteps);
  const shouldMarkComplete =
    typeof totalSteps === 'number' && totalSteps > 0
      ? completedSteps.length >= totalSteps
      : Boolean(data.onboardingCompleted);

  await updateDoc(userRef, {
    onboardingStepsCompleted: completedSteps,
    ...(shouldMarkComplete && { onboardingCompleted: true }),
    updatedAt: serverTimestamp(),
  });
}

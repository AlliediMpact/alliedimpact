import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { EduTechUser } from '@/types';

// Lightweight gamification system: XP + a few key badges.

export type BadgeId =
  | 'first_course'
  | 'three_courses'
  | 'five_courses'
  | 'streak_3'
  | 'streak_7'
  | 'hours_5'
  | 'hours_20'
  | 'xp_100'
  | 'xp_500';

interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
}

export const GAMIFICATION_BADGES: BadgeDefinition[] = [
  {
    id: 'first_course',
    name: 'First Milestone',
    description: 'Complete your first course.',
  },
  {
    id: 'three_courses',
    name: 'Dedicated Learner',
    description: 'Complete 3 courses.',
  },
  {
    id: 'five_courses',
    name: 'Course Finisher',
    description: 'Complete 5 courses.',
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Learn 3 days in a row.',
  },
  {
    id: 'streak_7',
    name: '7-Day Streak',
    description: 'Learn 7 days in a row.',
  },
  {
    id: 'hours_5',
    name: '5 Hours Learned',
    description: 'Reach 5 hours of learning time.',
  },
  {
    id: 'hours_20',
    name: '20 Hours Learned',
    description: 'Reach 20 hours of learning time.',
  },
  {
    id: 'xp_100',
    name: 'Level Up',
    description: 'Earn 100 XP from your learning activities.',
  },
  {
    id: 'xp_500',
    name: 'Learning Champion',
    description: 'Earn 500 XP from your learning activities.',
  },
];

export async function awardXP(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;

  const userRef = doc(db, 'edutech_users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return;
  }

  const data = snap.data() as EduTechUser;
  const currentXP = data.totalXP || 0;
  const newXP = currentXP + amount;

  await updateDoc(userRef, {
    totalXP: increment(amount),
    updatedAt: serverTimestamp(),
  });

  // After XP changes, re-check XP-based badges.
  await checkAndAwardBadges(userId, {
    ...data,
    totalXP: newXP,
  });
}

export async function awardXPForLessonCompletion(userId: string): Promise<void> {
  // Simple rule: 10 XP per lesson completed.
  await awardXP(userId, 10);
}

export async function checkAndAwardBadges(
  userId: string,
  userOverride?: Partial<EduTechUser>
): Promise<BadgeId[]> {
  const userRef = doc(db, 'edutech_users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return [];
  }

  const data = snap.data() as EduTechUser;
  const user: EduTechUser = { ...data, ...userOverride } as EduTechUser;

  const unlocked = new Set<BadgeId>((user.unlockedBadges as BadgeId[] | undefined) || []);
  const newlyUnlocked: BadgeId[] = [];

  const totalCoursesCompleted = user.totalCoursesCompleted || 0;
  const currentStreak = user.currentStreak || 0;
  const totalHoursLearned = user.totalHoursLearned || 0;
  const totalXP = user.totalXP || 0;

  const maybeUnlock = (id: BadgeId, condition: boolean) => {
    if (condition && !unlocked.has(id)) {
      unlocked.add(id);
      newlyUnlocked.push(id);
    }
  };

  // Course completion badges
  maybeUnlock('first_course', totalCoursesCompleted >= 1);
  maybeUnlock('three_courses', totalCoursesCompleted >= 3);
  maybeUnlock('five_courses', totalCoursesCompleted >= 5);

  // Streak badges
  maybeUnlock('streak_3', currentStreak >= 3);
  maybeUnlock('streak_7', currentStreak >= 7);

  // Hours learned badges
  maybeUnlock('hours_5', totalHoursLearned >= 5);
  maybeUnlock('hours_20', totalHoursLearned >= 20);

  // XP badges
  maybeUnlock('xp_100', totalXP >= 100);
  maybeUnlock('xp_500', totalXP >= 500);

  if (newlyUnlocked.length === 0) {
    return [];
  }

  await updateDoc(userRef, {
    unlockedBadges: Array.from(unlocked),
    updatedAt: serverTimestamp(),
  });

  return newlyUnlocked;
}

/**
 * User Archetypes
 * 
 * Defines user types and roles across the Allied iMpact platform.
 * Users can have multiple archetypes simultaneously.
 * 
 * @package @allied-impact/shared
 */

import { Timestamp } from 'firebase/firestore';

export enum UserArchetype {
  INDIVIDUAL = 'individual',
  MY_PROJECTS = 'my_projects',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  archetypes: UserArchetype[];
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  
  // Individual/Learner context
  subscriptions?: string[];  // Product IDs
  
  // Project context
  projectIds?: string[];
  
  // Preferences
  preferences?: {
    defaultView?: string;
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  
  // Metadata
  metadata?: Record<string, any>;
};

/**
 * Get dashboard sections visible to this user
 * Based on their archetypes
 */
export function getDashboardSections(profile: UserProfile): string[] {
  const sections: string[] = [];
  
  // Everyone gets personal section
  if (profile.archetypes.includes(UserArchetype.INDIVIDUAL) ||
      profile.archetypes.includes(UserArchetype.LEARNER)) {
    sections.push('my-subscriptions', 'recommended-products', 'recent-activity');
  }
  
  // Organization management
  if (profile.archetypes.includes(UserArchetype.INSTITUTION) ||
      profile.archetypes.includes(UserArchetype.NGO)) {
    sections.push('organization-overview', 'user-management', 'programs-management');
  }
  
  // Individual - App subscriptions
  if (profile.archetypes.includes(UserArchetype.INDIVIDUAL)) {
    sections.push('my-subscriptions', 'recommended-products', 'recent-activity');
  }
  
  // Projects - Custom solutions
  if (profile.archetypes.includes(UserArchetype.MY_PROJECTS)) {
    sections.push('my-projects', 'project-timeline', 'support-tickets', 'deliverable
 * Check if user has specific archetype
 */
export function hasArchetype(profile: UserProfile, archetype: UserArchetype): boolean {
  return profile.archetypes.includes(archetype);
}

/**
 * Check if user has any of the specified archetypes
 */
export function hasAnyArchetype(profile: UserProfile, archetypes: UserArchetype[]): boolean {
  return archetypes.some(archetype => profile.archetypes.includes(archetype));
}

/**
 * Check if user has all of the specified archetypes
 */
export function hasAllArchetypes(profile: UserProfile, archetypes: UserArchetype[]): boolean {
  return archetypes.every(archetype => profile.archetypes.includes(archetype));
}

/**
 * Add archetype to user profile
 * Returns updated archetypes array (immutable)
 */
export function addArchetype(
  currentArchetypes: UserArchetype[], 
  newArchetype: UserArchetype
): UserArchetype[] {
  if (currentArchetypes.includes(newArchetype)) {
    return currentArchetypes; // Already has it
  }
  return [...currentArchetypes, newArchetype];
}

/**
 * Remove archetype from user profile
 * Returns updated archetypes array (immutable)
 */
export function removeArchetype(
  currentArchetypes: UserArchetype[], 
  archetypeToRemove: UserArchetype
): UserArchetype[] {
  return currentArchetypes.filter(a => a !== archetypeToRemove);
}

/**
 * Get human-readable archetype labels
 */
export function getArchetypeLabel(archetype: UserArchetype): string {
  const labels: Record<UserArchetype, string> = {
    [UserArchetype.INDIVIDUAL]: 'Individual User',
    [UserArchetype.LEARNER]: 'Learner',
    [UserArchetype.INVESTOR]: 'Investor',
    [UserArchetype.SPONSOR]: 'Sponsor',
    [UserArchetype.NGO]: 'NGO',
    [UserArchetype.INSTITUTION]: 'Institution',
    [UserArchetype.CUSTOM_CLIENT]: 'Client',
    [UserArchetype.ADMIN]: 'Administrator',
    [UserArchetype.SUPER_ADMIN]: 'Super Administrator'
  };
  
  return labels[archetype];
}

/**
 * Get archetype icon
 */
export function getArchetypeIcon(archetype: UserArchetype): string {
  const icons: Record<UserArchetype, string> = {
    [UserArchetype.INDIVIDUAL]: '👤',
    [UserArchetype.LEARNER]: '🎓',
    [UserArchetype.INVESTOR]: '💼',
    [UserArchetype.SPONSOR]: '💝',
    [UserArchetype.NGO]: '🤝',
    [UserArchetype.INSTITUTION]: '🏢',
    [UserArchetype.CUSTOM_CLIENT]: '📋',
    [UserArchetype.MY_PROJECTS]: 'My Projects

/**
 * Default archetype for new users
 */
export const DEFAULT_ARCHETYPE = UserArchetype.INDIVIDUAL;

/**
 * Archetypes that require approval/verification
 */
export const RESTRICTED_ARCHETYPES = [
  UserArchetype.ADMIN,
  UserArchetype.SUPER_ADMIN,
  UserArchetype.INSTITUTION,
  UserArchetype.NGO
];

/**
 * Check if archetype requires approval
 */MY_PROJECTS
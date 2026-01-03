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
  LEARNER = 'learner',
  INVESTOR = 'investor',
  SPONSOR = 'sponsor',
  NGO = 'ngo',
  INSTITUTION = 'institution',
  CUSTOM_CLIENT = 'custom_client',
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
  
  // Organization context
  organizationId?: string;
  organizationRole?: 'admin' | 'member';
  
  // Sponsor/Investor context
  sponsorships?: Array<{
    id: string;
    initiative: string;
    amount: number;
    startDate: Date;
  }>;
  
  // Custom Client context
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
  
  // Impact tracking
  if (profile.archetypes.includes(UserArchetype.SPONSOR) ||
      profile.archetypes.includes(UserArchetype.INVESTOR)) {
    sections.push('my-sponsorships', 'impact-metrics', 'funding-opportunities');
  }
  
  // Project tracking
  if (profile.archetypes.includes(UserArchetype.CUSTOM_CLIENT)) {
    sections.push('my-projects', 'project-timeline', 'support-tickets');
  }
  
  // Platform administration
  if (profile.archetypes.includes(UserArchetype.ADMIN) ||
      profile.archetypes.includes(UserArchetype.SUPER_ADMIN)) {
    sections.push('admin-panel', 'platform-analytics', 'user-admin', 'system-monitoring');
  }
  
  return sections;
}

/**
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
    [UserArchetype.ADMIN]: '⚙️',
    [UserArchetype.SUPER_ADMIN]: '👑'
  };
  
  return icons[archetype];
}

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
 */
export function requiresApproval(archetype: UserArchetype): boolean {
  return RESTRICTED_ARCHETYPES.includes(archetype);
}

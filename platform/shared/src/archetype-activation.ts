/**
 * Archetype Activation Service
 * 
 * Determines which user archetypes are ACTIVE based on real conditions.
 * 
 * V1 Archetypes (Simplified):
 * - INDIVIDUAL: Everyone gets this on signup (default)
 * - ADMIN: Platform administrators
 * - SUPER_ADMIN: Super administrators
 * 
 * @package @allied-impact/shared
 */

import { UserArchetype, UserProfile } from './user-archetypes';

/**
 * V1 Activation Rules
 * 
 * - INDIVIDUAL: Everyone gets this on signup
 * - ADMIN/SUPER_ADMIN: Manually assigned by platform admins
 */

export interface ArchetypeActivationContext {
  userId: string;
  profile?: UserProfile;
  
  // Subscription context
  activeSubscriptions?: string[];  // Product IDs (e.g., 'coinbox', 'drivemaster', 'myprojects')
  
  // Admin grants (manual overrides)
  adminGrants?: UserArchetype[];
}

/**
 * Check if user has an ACTIVE archetype
 * 
 * V1 BEHAVIOR:
 * - INDIVIDUAL: Always true for authenticated users
 * - ADMIN/SUPER_ADMIN: Check if granted by admin
 */
export async function hasActiveArchetype(
  userId: string,
  archetype: UserArchetype,
  context?: ArchetypeActivationContext
): Promise<boolean> {
  if (archetype === UserArchetype.INDIVIDUAL) {
    return true; // Everyone gets this
  }
  
  if (archetype === UserArchetype.ADMIN || archetype === UserArchetype.SUPER_ADMIN) {
    // Check if admin grant exists or check profile
    return context?.adminGrants?.includes(archetype) ?? 
           context?.profile?.archetypes?.includes(archetype) ?? 
           false;
  }
  
  return false;
}

/**
 * Get all ACTIVE archetypes for a user
 * 
 * V1: Returns [INDIVIDUAL] for regular users, adds ADMIN/SUPER_ADMIN if granted
 */
export async function getActiveArchetypes(
  userId: string,
  context?: ArchetypeActivationContext
): Promise<UserArchetype[]> {
  const activeArchetypes: UserArchetype[] = [];
  
  // Everyone gets INDIVIDUAL
  activeArchetypes.push(UserArchetype.INDIVIDUAL);
  
  // Check ADMIN
  if (await hasActiveArchetype(userId, UserArchetype.ADMIN, context)) {
    activeArchetypes.push(UserArchetype.ADMIN);
  }
  
  // Check SUPER_ADMIN
  if (await hasActiveArchetype(userId, UserArchetype.SUPER_ADMIN, context)) {
    activeArchetypes.push(UserArchetype.SUPER_ADMIN);
  }
  
  return activeArchetypes;
}

/**
 * Get activation requirements for an archetype
 * Used to show informational messages
 */
export function getActivationRequirements(archetype: UserArchetype): {
  title: string;
  message: string;
  action?: string;
  actionLabel?: string;
} {
  const requirements: Record<UserArchetype, {
    title: string;
    message: string;
    action?: string;
    actionLabel?: string;
  }> = {
    [UserArchetype.INDIVIDUAL]: {
      title: 'Dashboard',
      message: 'Your personal dashboard showing all available apps.',
      action: undefined,
      actionLabel: undefined
    },
    [UserArchetype.ADMIN]: {
      title: 'Admin Dashboard',
      message: 'This dashboard is only available to platform administrators.',
      action: undefined,
      actionLabel: undefined
    },
    [UserArchetype.SUPER_ADMIN]: {
      title: 'Super Admin Dashboard',
      message: 'This dashboard is only available to platform super administrators.',
      action: undefined,
      actionLabel: undefined
    }
  };
  
  return requirements[archetype];
}

/**
 * Check if archetype is active in V1
 */
export function isActiveArchetype(archetype: UserArchetype): boolean {
  return archetype === UserArchetype.INDIVIDUAL || 
         archetype === UserArchetype.ADMIN || 
         archetype === UserArchetype.SUPER_ADMIN;
}
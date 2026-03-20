/**
 * User Archetypes
 *
 * Defines user types and roles across the Allied iMpact platform.
 * Users can have multiple archetypes simultaneously.
 *
 * @package @allied-impact/shared
 */
import { Timestamp } from 'firebase/firestore';
export declare enum UserArchetype {
    INDIVIDUAL = "individual",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export type UserProfile = {
    uid: string;
    email: string;
    name: string;
    archetypes: UserArchetype[];
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    subscriptions?: string[];
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
    metadata?: Record<string, any>;
};
/**
 * Get dashboard sections visible to this user
 * Based on their archetypes
 */
export declare function getDashboardSections(profile: UserProfile): string[];
/**
 * Check if user has specific archetype
 */
export declare function hasArchetype(profile: UserProfile, archetype: UserArchetype): boolean;
/**
 * Check if user has any of the specified archetypes
 */
export declare function hasAnyArchetype(profile: UserProfile, archetypes: UserArchetype[]): boolean;
/**
 * Check if user has all of the specified archetypes
 */
export declare function hasAllArchetypes(profile: UserProfile, archetypes: UserArchetype[]): boolean;
/**
 * Add archetype to user profile
 * Returns updated archetypes array (immutable)
 */
export declare function addArchetype(currentArchetypes: UserArchetype[], newArchetype: UserArchetype): UserArchetype[];
/**
 * Remove archetype from user profile
 * Returns updated archetypes array (immutable)
 */
export declare function removeArchetype(currentArchetypes: UserArchetype[], archetypeToRemove: UserArchetype): UserArchetype[];
/**
 * Get human-readable archetype labels
 */
export declare function getArchetypeLabel(archetype: UserArchetype): string;
/**
 * Get archetype icon
 */
export declare function getArchetypeIcon(archetype: UserArchetype): string;
/**
 * Default archetype for new users
 */
export declare const DEFAULT_ARCHETYPE = UserArchetype.INDIVIDUAL;
/**
 * Archetypes that require approval/verification
 */
export declare const RESTRICTED_ARCHETYPES: UserArchetype[];
//# sourceMappingURL=user-archetypes.d.ts.map
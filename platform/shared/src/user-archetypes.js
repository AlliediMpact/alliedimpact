"use strict";
/**
 * User Archetypes
 *
 * Defines user types and roles across the Allied iMpact platform.
 * Users can have multiple archetypes simultaneously.
 *
 * @package @allied-impact/shared
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESTRICTED_ARCHETYPES = exports.DEFAULT_ARCHETYPE = exports.UserArchetype = void 0;
exports.getDashboardSections = getDashboardSections;
exports.hasArchetype = hasArchetype;
exports.hasAnyArchetype = hasAnyArchetype;
exports.hasAllArchetypes = hasAllArchetypes;
exports.addArchetype = addArchetype;
exports.removeArchetype = removeArchetype;
exports.getArchetypeLabel = getArchetypeLabel;
exports.getArchetypeIcon = getArchetypeIcon;
var UserArchetype;
(function (UserArchetype) {
    UserArchetype["INDIVIDUAL"] = "individual";
    UserArchetype["ADMIN"] = "admin";
    UserArchetype["SUPER_ADMIN"] = "super_admin";
})(UserArchetype || (exports.UserArchetype = UserArchetype = {}));
/**
 * Get dashboard sections visible to this user
 * Based on their archetypes
 */
function getDashboardSections(profile) {
    const sections = [];
    // Individual - App subscriptions (default for everyone)
    if (profile.archetypes.includes(UserArchetype.INDIVIDUAL)) {
        sections.push('my-subscriptions', 'recommended-products', 'recent-activity');
    }
    return sections;
}
/**
 * Check if user has specific archetype
 */
function hasArchetype(profile, archetype) {
    return profile.archetypes.includes(archetype);
}
/**
 * Check if user has any of the specified archetypes
 */
function hasAnyArchetype(profile, archetypes) {
    return archetypes.some(archetype => profile.archetypes.includes(archetype));
}
/**
 * Check if user has all of the specified archetypes
 */
function hasAllArchetypes(profile, archetypes) {
    return archetypes.every(archetype => profile.archetypes.includes(archetype));
}
/**
 * Add archetype to user profile
 * Returns updated archetypes array (immutable)
 */
function addArchetype(currentArchetypes, newArchetype) {
    if (currentArchetypes.includes(newArchetype)) {
        return currentArchetypes; // Already has it
    }
    return [...currentArchetypes, newArchetype];
}
/**
 * Remove archetype from user profile
 * Returns updated archetypes array (immutable)
 */
function removeArchetype(currentArchetypes, archetypeToRemove) {
    return currentArchetypes.filter(a => a !== archetypeToRemove);
}
/**
 * Get human-readable archetype labels
 */
function getArchetypeLabel(archetype) {
    const labels = {
        [UserArchetype.INDIVIDUAL]: 'Individual User',
        [UserArchetype.ADMIN]: 'Administrator',
        [UserArchetype.SUPER_ADMIN]: 'Super Administrator'
    };
    return labels[archetype];
}
/**
 * Get archetype icon
 */
function getArchetypeIcon(archetype) {
    const icons = {
        [UserArchetype.INDIVIDUAL]: '👤',
        [UserArchetype.ADMIN]: '👨‍💼',
        [UserArchetype.SUPER_ADMIN]: '⚡'
    };
    return icons[archetype] || '👤';
}
/**
 * Default archetype for new users
 */
exports.DEFAULT_ARCHETYPE = UserArchetype.INDIVIDUAL;
/**
 * Archetypes that require approval/verification
 */
exports.RESTRICTED_ARCHETYPES = [
    UserArchetype.ADMIN,
    UserArchetype.SUPER_ADMIN
];
//# sourceMappingURL=user-archetypes.js.map
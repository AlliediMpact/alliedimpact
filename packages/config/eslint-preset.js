/**
 * ESLint Configuration - Allied iMpact Platform
 * 
 * CRITICAL BOUNDARIES:
 * This config enforces architectural rules to prevent cross-app coupling.
 * 
 * RULES:
 * 1. Apps CANNOT import from other apps
 * 2. Shared UI CANNOT import Firebase, services, or business logic
 * 3. Each app must remain independently deployable
 * 
 * Violations will cause build failures.
 */

module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // CRITICAL: Prevent cross-app imports
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['apps/*', '../apps/*', '../../apps/*'],
            message:
              '❌ FORBIDDEN: Apps cannot import from other apps. Each app must be independent.',
          },
          {
            group: ['**/firebase', '**/firebase/*'],
            message:
              '❌ FORBIDDEN: Shared UI cannot import Firebase. Pass data via props.',
          },
          {
            group: ['**/services/*', '**/server-actions/*'],
            message:
              '❌ FORBIDDEN: Shared UI cannot import services. Components must be data-agnostic.',
          },
          {
            group: ['**/lib/auth*', '**/contexts/*Context'],
            message:
              '❌ FORBIDDEN: Shared UI cannot import auth/context directly. Pass via props.',
          },
        ],
      },
    ],
  },
};

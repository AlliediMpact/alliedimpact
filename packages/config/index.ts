/**
 * Allied iMpact Config Package
 * 
 * Exports design tokens and configuration utilities
 * for use across all Allied iMpact apps.
 * 
 * USAGE:
 * ```typescript
 * import { tokens, colors, spacing } from '@allied-impact/config';
 * import { generateTailwindConfig } from '@allied-impact/config/tailwind';
 * ```
 */

export * from './design-tokens';
export { generateTailwindConfig } from './tailwind.config';

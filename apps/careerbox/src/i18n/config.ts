/**
 * i18n Configuration
 * Internationalization settings for CareerBox
 */

export const locales = ['en', 'zu', 'st'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

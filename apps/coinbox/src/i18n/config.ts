import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Import all message files at build time
import enMessages from './messages/en.json';
import afMessages from './messages/af.json';
import zuMessages from './messages/zu.json';
import xhMessages from './messages/xh.json';

// Supported locales
export const locales = ['en', 'af', 'zu', 'xh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Locale labels for display
export const localeLabels: Record<Locale, string> = {
  en: '🇬🇧 English',
  af: '🇿🇦 Afrikaans',
  zu: '🇿🇦 isiZulu',
  xh: '🇿🇦 isiXhosa',
};

// Locale names in their native language
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
};

// Pre-loaded messages
const messages: Record<Locale, any> = {
  en: enMessages,
  af: afMessages,
  zu: zuMessages,
  xh: xhMessages,
};

export default getRequestConfig(({ locale }) => {
  // Normalize to a supported locale; fall back to default instead of 404
  const normalizedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  console.log('[i18n config] getRequestConfig called', {
    rawLocale: locale,
    normalizedLocale,
  });

  const config = {
    locale: normalizedLocale,
    messages: messages[normalizedLocale],
  };

  console.log('[i18n config] returning config', config ? { hasLocale: !!config.locale, hasMessages: !!config.messages } : null);

  return config;
});

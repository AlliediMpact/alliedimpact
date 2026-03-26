import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is valid
  if (!locales.includes(locale as any)) {
    return {
      messages: {},
    };
  }

  // Return empty messages object - careerbox doesn't use i18n messages
  return {
    messages: {},
  };
});

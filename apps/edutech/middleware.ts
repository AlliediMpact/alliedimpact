import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always', // Ensures all routes include locale prefix
});

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - robots.txt (SEO file)
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};

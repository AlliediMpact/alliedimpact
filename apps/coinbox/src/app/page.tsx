import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

// Root page redirects to default locale
// The actual home page is at /[locale]/page.tsx
export const dynamic = 'force-dynamic';

export default function RootPage() {
  const locale = defaultLocale || 'en';
  redirect(`/${locale}`);
}

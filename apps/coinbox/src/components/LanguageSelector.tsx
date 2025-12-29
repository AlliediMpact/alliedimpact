'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { locales, localeLabels, localeNativeNames, type Locale } from '@/i18n/config';
import { useTransition } from 'react';

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const currentLocale = (params?.locale as Locale) || 'en';

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      // Replace the locale in the current pathname
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPathname = segments.join('/');

      router.push(newPathname);
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        disabled={isPending}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200
                 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 
                 focus:border-transparent transition-all duration-200 cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select language"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeLabels[locale]}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isPending ? 'animate-spin' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isPending ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

// Language selector dropdown variant (for mobile menu or settings page)
export function LanguageDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const currentLocale = (params?.locale as Locale) || 'en';

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPathname = segments.join('/');

      router.push(newPathname);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Language / Taal / Ulimi
      </label>
      <div className="grid grid-cols-2 gap-3">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            disabled={isPending}
            className={`
              flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium
              transition-all duration-200 border-2
              ${
                currentLocale === locale
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary-400'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Switch to ${localeNativeNames[locale]}`}
            aria-pressed={currentLocale === locale}
          >
            <span className="mr-2 text-xl">{localeLabels[locale].split(' ')[0]}</span>
            <span>{localeNativeNames[locale]}</span>
          </button>
        ))}
      </div>

      {isPending && (
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Switching language...
        </div>
      )}
    </div>
  );
}

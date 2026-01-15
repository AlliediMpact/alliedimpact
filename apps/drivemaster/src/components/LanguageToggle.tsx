'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

/**
 * LanguageToggle Component
 * 
 * Allows users to switch between English and Afrikaans
 * Stores preference in localStorage
 */

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Store preference
    localStorage.setItem('locale', newLocale);
    
    // For now, we'll just store the preference
    // Full implementation would require routing changes
    // You can reload the page or use next-intl routing
    window.location.reload();
  };

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  return (
    <div className="relative group">
      <button
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              locale === language.code ? 'bg-primary-50 dark:bg-primary-900' : ''
            }`}
          >
            <span className="text-2xl">{language.flag}</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{language.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{language.code.toUpperCase()}</div>
            </div>
            {locale === language.code && (
              <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple language toggle button (compact version)
 */
export function LanguageToggleCompact() {
  const locale = useLocale();

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'af' : 'en';
    localStorage.setItem('locale', newLocale);
    window.location.reload();
  };

  return (
    <button
      onClick={switchLanguage}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle language"
      title={`Switch to ${locale === 'en' ? 'Afrikaans' : 'English'}`}
    >
      <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
    </button>
  );
}

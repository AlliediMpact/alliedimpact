'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X, User, LogOut, Award, BookOpen, Users, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Logo } from '@allied-impact/ui';

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: t('navigation.home'), href: '/en' },
    { name: t('navigation.courses'), href: '/en/courses' },
    { name: 'Forum', href: '/en/forum' },
    { name: t('navigation.about'), href: '/en/about' },
    { name: t('navigation.pricing'), href: '/en/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/ogo 
          appName="EduTech" 
          onClick={() => router.push('/en')}
          size="md"
        /n className="font-bold text-xl">{t('appName')}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary-blue ${
                pathname === item.href
                  ? 'text-primary-blue'
                  : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {/* Notification Center */}
              <NotificationCenter />
              
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium"
                >
                  <User className="h-5 w-5" />
                  <span>{user.displayName || user.email}</span>
                </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg">
                  <Link
                    href="/en/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  {isInstructor && (
                    <Link
                      href="/en/instructor/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >56 bg-background border rounded-lg shadow-lg py-1">
                  <Link
                    href="/en/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  
                  {/* Role-based dashboards */}
                  {user.userType === 'facilitator' && (
                    <Link
                      href="/en/facilitator/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted border-t"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Facilitator Dashboard</span>
                    </Link>
                  )}
                  
                  {user.userType === 'content_admin' && (
                    <Link
                      href="/en/content-admin/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted border-t"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Content Admin</span>
                    </Link>
                  )}
                  
                  {user.userType === 'system_admin' && (
                    <Link
                      href="/en/admin/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted border-t"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin Panel space-x-2 px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Award className="h-4 w-4" />
                    <span>Certificates</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/en/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary-blue"
              >
                {t('common.login')}
              </Link>
              <Link
                href="/en/signup"
                className="bg-primary-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-blue/90"
              >
                {t('common.signup')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-primary-blue"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-3 border-t space-y-3">
              {user ? (
                <>
                  <Link
                    href="/en/dashboard"
                    className="block text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/en/login"
                    className="block text-sm font-medium text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/en/signup"
                    className="block bg-primary-blue text-white px-4 py-2 rounded-lg text-sm font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

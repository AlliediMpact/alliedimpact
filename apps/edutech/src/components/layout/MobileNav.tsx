/**
 * Mobile Bottom Navigation
 * Fixed bottom navigation for mobile devices (similar to Coinbox pattern)
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageSquare, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/en',
    icon: Home,
  },
  {
    label: 'Courses',
    href: '/en/courses',
    icon: BookOpen,
  },
  {
    label: 'Learn',
    href: '/en/dashboard',
    icon: GraduationCap,
    requiresAuth: true,
  },
  {
    label: 'Forum',
    href: '/en/forum',
    icon: MessageSquare,
  },
  {
    label: 'Profile',
    href: '/en/profile',
    icon: User,
    requiresAuth: true,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter items based on auth status
  const filteredItems = navItems.filter((item) => {
    if (item.requiresAuth && !user) return false;
    return true;
  });

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16 md:hidden" />
      
      {/* Fixed Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  'hover:bg-muted/50 rounded-lg',
                  isActive ? 'text-primary-blue' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive && 'text-primary-blue'
                  )}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

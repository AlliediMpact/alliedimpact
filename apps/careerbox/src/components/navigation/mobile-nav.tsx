'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Home, Briefcase, Users, MessageCircle, Settings, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  userType?: 'individual' | 'company';
}

export function MobileNav({ userType = 'individual' }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const individualNavItems = [
    { label: 'Dashboard', href: '/dashboard/individual', icon: Home },
    { label: 'Matches', href: '/dashboard/individual/matches', icon: Briefcase },
    { label: 'Applications', href: '/dashboard/individual/applications', icon: Briefcase },
    { label: 'Messages', href: '/dashboard/individual/messages', icon: MessageCircle },
    { label: 'Profile', href: '/profile/individual/edit', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const companyNavItems = [
    { label: 'Dashboard', href: '/dashboard/company', icon: Home },
    { label: 'Listings', href: '/dashboard/company/listings', icon: Briefcase },
    { label: 'Applicants', href: '/dashboard/company/applicants', icon: Users },
    { label: 'Messages', href: '/dashboard/company/messages', icon: MessageCircle },
    { label: 'Profile', href: '/profile/company/edit', icon: Settings },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const navItems = userType === 'individual' ? individualNavItems : companyNavItems;

  const isActive = (href: string) => {
    return pathname === `/${locale}${href}`;
  };

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">CareerBox</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {userType === 'individual' ? 'Job Seeker Dashboard' : 'Employer Dashboard'}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Notifications Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href={`/${locale}/notifications`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="font-medium">Notifications</span>
              </Link>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                // TODO: Implement logout
                router.push(`/${locale}/login`);
              }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

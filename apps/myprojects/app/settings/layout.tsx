'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@allied-impact/ui';
import { User, Shield, Bell, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Manage your personal information'
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Password and account security'
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email and notification preferences'
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: SettingsIcon,
    description: 'Customize your experience'
  }
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;
                
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div>{tab.name}</div>
                      <div className={cn(
                        "text-xs mt-0.5 hidden md:block",
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {tab.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}

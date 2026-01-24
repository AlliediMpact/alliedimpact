'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ControlHub</h1>
              <p className="text-xs text-muted-foreground">Platform Observability</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md p-2 hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button
              className="rounded-md p-2 hover:bg-muted transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md p-2 hover:bg-muted transition-colors"
              >
                <span className="text-sm text-muted-foreground">{user?.email || 'Admin User'}</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-2 shadow-lg">
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container mx-auto flex gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <nav className="space-y-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <span>📊</span>
              Dashboard
            </a>
            <a
              href="/dashboard/apps"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <span>🎯</span>
              App Health
            </a>
            <a
              href="/dashboard/security"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <span>🔒</span>
              Security
            </a>
            <a
              href="/dashboard/audit"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <span>📋</span>
              Audit Logs
            </a>
            <a
              href="/dashboard/alerts"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <span>🚨</span>
              Alerts
            </a>
            <a
              href="/dashboard/support"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <span>💬</span>
              Support
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

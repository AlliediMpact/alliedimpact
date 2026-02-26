'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, cupfinalUser, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SportsHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                  isActive('/dashboard') ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/tournaments"
                className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                  isActive('/tournaments') ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                Tournaments
              </Link>
              <Link
                href="/wallet"
                className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                  isActive('/wallet') ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                Wallet
              </Link>
              {cupfinalUser?.role !== 'fan' && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                    isActive('/admin') ? 'text-purple-600' : 'text-gray-600'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentUser.photoURL || undefined} />
                    <AvatarFallback>
                      {cupfinalUser?.displayName?.charAt(0) || currentUser.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{cupfinalUser?.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{cupfinalUser?.role}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && currentUser && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/tournaments"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tournaments
              </Link>
              <Link
                href="/wallet"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wallet
              </Link>
              {cupfinalUser?.role !== 'fan' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

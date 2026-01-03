'use client';

import { useDashboard } from '../lib/dashboard-context';
import { Button } from '@allied-impact/ui';
import { LogOut, User, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardNav() {
  const { user, platformUser, signOut } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">Allied iMpact</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/subscriptions" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Subscriptions
            </Link>
            <Link 
              href="/profile" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Profile
            </Link>
            {/* TODO: Show only for admin users */}
            <Link 
              href="/admin" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{platformUser?.displayName || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-accent rounded-md"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <div className="px-2 py-2 bg-accent rounded-md">
              <p className="text-sm font-medium">{platformUser?.displayName || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            
            <Link 
              href="/" 
              className="block px-2 py-2 text-foreground hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/subscriptions" 
              className="block px-2 py-2 text-foreground hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Subscriptions
            </Link>
            <Link 
              href="/profile" 
              className="block px-2 py-2 text-foreground hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            {/* TODO: Show only for admin users */}
            <Link 
              href="/admin" 
              className="block px-2 py-2 text-foreground hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

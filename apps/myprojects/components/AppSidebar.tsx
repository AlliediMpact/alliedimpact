'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Briefcase, 
  Flag, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  HelpCircle,
  X,
  Clock
} from 'lucide-react';
import { Button } from '@allied-impact/ui';
import Logo from './Logo';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: any;
  href: string;
  description: string;
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Overview of your projects'
  },
  {
    label: 'Projects',
    icon: Briefcase,
    href: '/projects',
    description: 'All your projects'
  },
  {
    label: 'Milestones',
    icon: Flag,
    href: '/milestones',
    description: 'Project milestones'
  },
  {
    label: 'Deliverables',
    icon: FileText,
    href: '/deliverables',
    description: 'Project deliverables'
  },
  {
    label: 'Tickets',
    icon: MessageSquare,
    href: '/tickets',
    description: 'Support tickets'
  },
  {
    label: 'Activity',
    icon: Clock,
    href: '/activity',
    description: 'Activity timeline'
  },
  {
    label: 'Team',
    icon: Users,
    href: '/team',
    description: 'Team members'
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    description: 'Account settings'
  },
  {
    label: 'Help',
    icon: HelpCircle,
    href: '/help',
    description: 'Help & documentation'
  },
];

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose(); // Close mobile menu after navigation
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Logo toDashboard className="text-white" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  'hover:bg-white/10',
                  active && 'bg-white/20 font-medium'
                )}
                title={item.description}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 text-center">
            © 2026 Allied iMpact
          </div>
        </div>
      </aside>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserArchetype } from '@allied-impact/shared';
import { Button } from '@allied-impact/ui';
import { 
  User, 
  Briefcase,
  Shield,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@allied-impact/ui';

interface ViewSwitcherProps {
  currentView: string;
  availableArchetypes: UserArchetype[];
}

const VIEW_CONFIG = {
  individual: {
    path: '/',
    label: 'Personal',
    icon: User,
    description: 'Your subscriptions and products'
  },
  projects: {
    path: '/projects',
    label: 'My Projects',
    icon: Briefcase,
    description: 'Track your custom projects'
  },
  admin: {
    path: '/admin',
    label: 'Admin',
    icon: Shield,
    description: 'Platform management'
  }
};

export function ViewSwitcher({ currentView, availableArchetypes }: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // === V1 GATING: Only show INDIVIDUAL and ADMIN dashboards ===
  // All other archetypes (Learner, Investor, Organization, Client, Sponsor) are DORMANT
  // until their corresponding products/contracts exist.
  const availableViews: string[] = [];
  avaMap archetypes to views
  const availableViews: string[] = [];
  availableArchetypes.forEach(archetype => {
    if (archetype === UserArchetype.INDIVIDUAL) {
      availableViews.push('individual');
    }
    if (archetype === UserArchetype.MY_PROJECTS) {
      availableViews.push('projects');
    }
    if (archetype === UserArchetype.ADMIN || archetype === UserArchetype.SUPER_ADMIN) {
      availableViews.push('admin');
    }
  });
  
  // Deduplicate views
  const uniqueViews = [...new Set(availableViews)];
  
  // Only show ViewSwitcher if user has multiple views
  if (uniqueViews.length <= 1) {
    return null;
  }
  const handleViewChange = (view: string) => {
    const config = VIEW_CONFIG[view as keyof typeof VIEW_CONFIG];
    if (config) {
      router.push(config.path);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span>{currentConfig.label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(VIEW_CONFIG).map(([key, config]) => {
          if (!uniquclassName="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(VIEW_CONFIG).map(([key, config]) => {
          if (!availableViews.includes(key)) return null;
          
          const Icon = config.icon;
          const isActive = currentView === key;
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleViewChange(key)}
              className={isActive ? 'bg-muted' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{config.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

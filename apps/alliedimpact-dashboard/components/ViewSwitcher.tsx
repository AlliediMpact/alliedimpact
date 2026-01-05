'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserArchetype } from '@allied-impact/shared';
import { Button } from '@allied-impact/ui';
import { 
  User, 
  Building2, 
  Briefcase, 
  Heart, 
  Shield,
  ChevronDown,
  GraduationCap,
  TrendingUp
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
  learner: {
    path: '/(learner)',
    label: 'Learning',
    icon: GraduationCap,
    description: 'Your courses and progress'
  },
  investor: {
    path: '/(investor)',
    label: 'Investments',
    icon: TrendingUp,
    description: 'Portfolio and returns'
  },
  organization: {
    path: '/organization',
    label: 'Organization',
    icon: Building2,
    description: 'Manage users and programs'
  },
  client: {
    path: '/client',
    label: 'Client',
    icon: Briefcase,
    description: 'Track your projects'
  },
  sponsor: {
    path: '/sponsor',
    label: 'Sponsor',
    icon: Heart,
    description: 'View impact metrics'
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
  
  // Determine available views based on archetypes
  const availableViews: string[] = [];
  availableArchetypes.forEach(archetype => {
    // Map archetypes to views
    if (archetype === UserArchetype.INDIVIDUAL) {
      availableViews.push('individual');
    }
    if (archetype === UserArchetype.LEARNER) {
      availableViews.push('learner');
    }
    if (archetype === UserArchetype.INVESTOR) {
      availableViews.push('investor');
    }
    if (archetype === UserArchetype.NGO || archetype === UserArchetype.INSTITUTION) {
      availableViews.push('organization');
    }
    if (archetype === UserArchetype.CUSTOM_CLIENT) {
      availableViews.push('client');
    }
    if (archetype === UserArchetype.SPONSOR) {
      availableViews.push('sponsor');
    }
    if (archetype === UserArchetype.ADMIN || archetype === UserArchetype.SUPER_ADMIN) {
      availableViews.push('admin');
    }uniqueViews.length <= 1) {
    return null;
  }

  const currentConfig = VIEW_CONFIG[currentView as keyof typeof VIEW_CONFIG] || VIEW_CONFIG.individual;
  const CurrentIcon = currentConfig.icon;

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

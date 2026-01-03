/**
 * Dashboard Engine
 * 
 * Core logic for role-aware dashboard routing and section management.
 * Determines which dashboard view to show based on user archetypes.
 * 
 * Pattern: One dashboard app, multiple persona views
 */

export enum UserArchetype {
  INDIVIDUAL = 'individual',
  LEARNER = 'learner',
  INVESTOR = 'investor',
  SPONSOR = 'sponsor',
  NGO = 'ngo',
  INSTITUTION = 'institution',
  CUSTOM_CLIENT = 'custom_client',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export type DashboardView = 
  | 'individual'      // Personal subscriptions (default)
  | 'organization'    // NGO/Institution management
  | 'client'          // Custom dev project tracking
  | 'sponsor'         // Impact tracking & sponsorships
  | 'admin'           // Platform management
  | 'super-admin';    // Full platform control

export type DashboardSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredArchetypes: UserArchetype[];
  order: number;
  enabled: boolean;
};

/**
 * Dashboard Engine Class
 * Stateless utility for dashboard routing and section management
 */
export class DashboardEngine {
  /**
   * Determine primary dashboard view based on user archetypes
   * Priority: Super Admin > Admin > Client > Sponsor > Organization > Individual
   */
  static getPrimaryView(archetypes: UserArchetype[]): DashboardView {
    if (!archetypes || archetypes.length === 0) {
      return 'individual'; // Default fallback
    }

    // Priority order (most specific to least specific)
    if (archetypes.includes(UserArchetype.SUPER_ADMIN)) {
      return 'super-admin';
    }
    if (archetypes.includes(UserArchetype.ADMIN)) {
      return 'admin';
    }
    if (archetypes.includes(UserArchetype.CUSTOM_CLIENT)) {
      return 'client';
    }
    if (archetypes.includes(UserArchetype.SPONSOR) || 
        archetypes.includes(UserArchetype.INVESTOR)) {
      return 'sponsor';
    }
    if (archetypes.includes(UserArchetype.INSTITUTION) ||
        archetypes.includes(UserArchetype.NGO)) {
      return 'organization';
    }
    
    // Default: individual (everyone has this implicitly)
    return 'individual';
  }

  /**
   * Get all available views for this user (for view switcher)
   * Users can switch between views if they have multiple archetypes
   */
  static getAvailableViews(archetypes: UserArchetype[]): DashboardView[] {
    if (!archetypes || archetypes.length === 0) {
      return ['individual'];
    }

    const views: DashboardView[] = ['individual']; // Everyone gets personal view
    
    if (archetypes.includes(UserArchetype.INSTITUTION) || 
        archetypes.includes(UserArchetype.NGO)) {
      views.push('organization');
    }
    
    if (archetypes.includes(UserArchetype.CUSTOM_CLIENT)) {
      views.push('client');
    }
    
    if (archetypes.includes(UserArchetype.SPONSOR) || 
        archetypes.includes(UserArchetype.INVESTOR)) {
      views.push('sponsor');
    }
    
    if (archetypes.includes(UserArchetype.ADMIN)) {
      views.push('admin');
    }
    
    if (archetypes.includes(UserArchetype.SUPER_ADMIN)) {
      views.push('super-admin');
    }
    
    return views;
  }

  /**
   * Get dashboard sections applicable to this user
   * Returns sections sorted by order
   */
  static getSections(archetypes: UserArchetype[]): DashboardSection[] {
    if (!archetypes || archetypes.length === 0) {
      archetypes = [UserArchetype.INDIVIDUAL];
    }

    return ALL_DASHBOARD_SECTIONS
      .filter(section => {
        if (!section.enabled) return false;
        
        // Check if user has any of the required archetypes
        return section.requiredArchetypes.some(required => 
          archetypes.includes(required)
        );
      })
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Check if user can access a specific view
   */
  static canAccessView(archetypes: UserArchetype[], view: DashboardView): boolean {
    const availableViews = this.getAvailableViews(archetypes);
    return availableViews.includes(view);
  }

  /**
   * Get view metadata
   */
  static getViewMetadata(view: DashboardView): {
    title: string;
    description: string;
    icon: string;
  } {
    const metadata = {
      'individual': {
        title: 'Personal Dashboard',
        description: 'Manage your subscriptions and products',
        icon: '👤'
      },
      'organization': {
        title: 'Organization Dashboard',
        description: 'Manage your organization and users',
        icon: '🏢'
      },
      'client': {
        title: 'Projects Dashboard',
        description: 'Track your custom development projects',
        icon: '📋'
      },
      'sponsor': {
        title: 'Impact Dashboard',
        description: 'Track your sponsorships and impact',
        icon: '💝'
      },
      'admin': {
        title: 'Admin Dashboard',
        description: 'Manage platform users and products',
        icon: '⚙️'
      },
      'super-admin': {
        title: 'Super Admin Dashboard',
        description: 'Full platform control and monitoring',
        icon: '👑'
      }
    };

    return metadata[view];
  }
}

/**
 * Dashboard Sections Registry
 * Defines all available sections and their access requirements
 */
export const ALL_DASHBOARD_SECTIONS: DashboardSection[] = [
  // Individual sections
  {
    id: 'my-subscriptions',
    title: 'My Subscriptions',
    description: 'Manage your product subscriptions',
    icon: '💳',
    requiredArchetypes: [UserArchetype.INDIVIDUAL, UserArchetype.LEARNER],
    order: 1,
    enabled: true
  },
  {
    id: 'recommended-products',
    title: 'Recommended for You',
    description: 'Discover new products',
    icon: '✨',
    requiredArchetypes: [UserArchetype.INDIVIDUAL, UserArchetype.LEARNER],
    order: 2,
    enabled: true
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    description: 'Your recent usage and actions',
    icon: '📊',
    requiredArchetypes: [UserArchetype.INDIVIDUAL, UserArchetype.LEARNER],
    order: 3,
    enabled: true
  },

  // Organization sections
  {
    id: 'organization-overview',
    title: 'Organization Overview',
    description: 'Your organization stats and info',
    icon: '🏢',
    requiredArchetypes: [UserArchetype.INSTITUTION, UserArchetype.NGO],
    order: 1,
    enabled: false // Phase 3
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage organization members',
    icon: '👥',
    requiredArchetypes: [UserArchetype.INSTITUTION, UserArchetype.NGO],
    order: 2,
    enabled: false // Phase 3
  },
  {
    id: 'programs-management',
    title: 'Programs & Access',
    description: 'Manage programs and entitlements',
    icon: '📚',
    requiredArchetypes: [UserArchetype.INSTITUTION, UserArchetype.NGO],
    order: 3,
    enabled: false // Phase 3
  },

  // Sponsor sections
  {
    id: 'my-sponsorships',
    title: 'My Sponsorships',
    description: 'Track your active sponsorships',
    icon: '💝',
    requiredArchetypes: [UserArchetype.SPONSOR, UserArchetype.INVESTOR],
    order: 1,
    enabled: false // Phase 5
  },
  {
    id: 'impact-metrics',
    title: 'Impact Dashboard',
    description: 'View your social impact metrics',
    icon: '📈',
    requiredArchetypes: [UserArchetype.SPONSOR, UserArchetype.INVESTOR],
    order: 2,
    enabled: false // Phase 5
  },

  // Client sections
  {
    id: 'my-projects',
    title: 'My Projects',
    description: 'Track your development projects',
    icon: '📋',
    requiredArchetypes: [UserArchetype.CUSTOM_CLIENT],
    order: 1,
    enabled: false // Phase 4
  },

  // Admin sections
  {
    id: 'admin-panel',
    title: 'Admin Panel',
    description: 'Platform management and monitoring',
    icon: '⚙️',
    requiredArchetypes: [UserArchetype.ADMIN, UserArchetype.SUPER_ADMIN],
    order: 1,
    enabled: true
  },
  {
    id: 'platform-analytics',
    title: 'Platform Analytics',
    description: 'Usage and performance metrics',
    icon: '📊',
    requiredArchetypes: [UserArchetype.ADMIN, UserArchetype.SUPER_ADMIN],
    order: 2,
    enabled: true
  }
];

/**
 * Helper: Detect archetypes from user profile
 * This is a basic implementation - can be enhanced based on business logic
 */
export function detectArchetypes(userProfile: {
  email: string;
  customClaims?: Record<string, any>;
  organizationId?: string;
  projectIds?: string[];
  sponsorships?: any[];
}): UserArchetype[] {
  const archetypes: UserArchetype[] = [UserArchetype.INDIVIDUAL]; // Default

  // Check for admin roles
  if (userProfile.customClaims?.admin === true) {
    archetypes.push(UserArchetype.ADMIN);
  }
  if (userProfile.customClaims?.superAdmin === true) {
    archetypes.push(UserArchetype.SUPER_ADMIN);
  }

  // Check for organization affiliation
  if (userProfile.organizationId) {
    archetypes.push(UserArchetype.INSTITUTION);
  }

  // Check for projects
  if (userProfile.projectIds && userProfile.projectIds.length > 0) {
    archetypes.push(UserArchetype.CUSTOM_CLIENT);
  }

  // Check for sponsorships
  if (userProfile.sponsorships && userProfile.sponsorships.length > 0) {
    archetypes.push(UserArchetype.SPONSOR);
  }

  return archetypes;
}

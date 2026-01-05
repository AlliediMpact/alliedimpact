/**
 * Product Categories
 * 
 * Defines product metadata and categorization across the Allied iMpact platform.
 * Three business models: Subscription, Impact, Custom
 * 
 * @package @allied-impact/shared
 */

export enum ProductCategory {
  SUBSCRIPTION = 'subscription',  // Paid subscription products
  IMPACT = 'impact',              // Sponsored/free impact initiatives
  CUSTOM = 'custom'               // Project-based custom solutions
}

export type ProductTier = {
  id: string;
  name: string;
  price: number;
  currency: string;
  features?: string[];
  limits?: Record<string, number>;
};

export type ProductMetadata = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  icon: string;
  url?: string;
  status: 'active' | 'coming-soon' | 'beta' | 'deprecated';
  
  // Subscription products
  subscription?: {
    tiers: ProductTier[];
    billingCycle: 'monthly' | 'yearly' | 'one-time';
    trialDays?: number;
  };
  
  // Impact products
  impact?: {
    targetAudience: 'youth' | 'schools' | 'community' | 'all';
    sponsorable: boolean;
    requiresApproval: boolean;
    freeAccess: boolean;
  };
  
  // Custom products
  custom?: {
    isProjectBased: boolean;
    requiresContract: boolean;
    estimatedDuration?: string;
  };
};

/**
 * Product Registry
 * Single source of truth for all Allied iMpact products
 */
export const PRODUCTS: Record<string, ProductMetadata> = {
  // === SUBSCRIPTION PRODUCTS ===
  
  coinbox: {
    id: 'coinbox',
    name: 'Coin Box',
    description: 'P2P Financial Platform - Loans, Investments & Crypto Trading',
    category: ProductCategory.SUBSCRIPTION,
    icon: '🪙',
    url: process.env.NODE_ENV === 'production' 
      ? 'https://coinbox.alliedimpact.com' 
      : 'http://localhost:3002',
    status: 'active',
    subscription: {
      tiers: [
        {
          id: 'basic',
          name: 'Basic',
          price: 550,
          currency: 'ZAR',
          features: [
            'P2P Loans up to R500',
            'Invest up to R5,000',
            'Crypto trading up to R5,000/trade',
            '1% commission on referrals'
          ],
          limits: {
            loanLimit: 500,
            investmentLimit: 5000,
            cryptoTradeLimit: 5000
          }
        },
        {
          id: 'ambassador',
          name: 'Ambassador',
          price: 1100,
          currency: 'ZAR',
          features: [
            'P2P Loans up to R1,000',
            'Invest up to R10,000',
            'Crypto trading up to R10,000/trade',
            '2% commission on referrals'
          ],
          limits: {
            loanLimit: 1000,
            investmentLimit: 10000,
            cryptoTradeLimit: 10000
          }
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 5500,
          currency: 'ZAR',
          features: [
            'P2P Loans up to R5,000',
            'Invest up to R50,000',
            'Crypto trading up to R50,000/trade',
            '3% commission on referrals',
            'Priority support'
          ],
          limits: {
            loanLimit: 5000,
            investmentLimit: 50000,
            cryptoTradeLimit: 50000
          }
        },
        {
          id: 'business',
          name: 'Business',
          price: 11000,
          currency: 'ZAR',
          features: [
            'P2P Loans up to R10,000',
            'Invest up to R100,000',
            'Crypto trading up to R100,000/trade',
            '5% commission on referrals',
            'VIP support',
            'Business account features'
          ],
          limits: {
            loanLimit: 10000,
            investmentLimit: 100000,
            cryptoTradeLimit: 100000
          }
        }
      ],
      billingCycle: 'one-time'
    }
  },

  drivemaster: {
    id: 'drivemaster',
    name: 'Drive Master',
    description: 'Learner License Training & K53 Test Preparation',
    category: ProductCategory.SUBSCRIPTION,
    icon: '🚗',
    status: 'coming-soon',
    subscription: {
      tiers: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          currency: 'ZAR',
          features: [
            '5 practice tests',
            'Basic theory lessons',
            'Progress tracking'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 99,
          currency: 'ZAR',
          features: [
            'Unlimited practice tests',
            'Full K53 theory course',
            'Video lessons',
            'Progress tracking',
            'Certificate of completion'
          ]
        },
        {
          id: 'lifetime',
          name: 'Lifetime',
          price: 999,
          currency: 'ZAR',
          features: [
            'Unlimited lifetime access',
            'All premium features',
            'Future updates included',
            'Priority support'
          ]
        }
      ],
      billingCycle: 'monthly',
      trialDays: 7
    }
  },

  codetech: {
    id: 'codetech',
    name: 'CodeTech',
    description: 'Coding Education & Certification Platform',
    category: ProductCategory.SUBSCRIPTION,
    icon: '💻',
    status: 'coming-soon',
    subscription: {
      tiers: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          currency: 'ZAR',
          features: [
            '3 beginner courses',
            'Basic coding challenges',
            'Community access'
          ]
        },
        {
          id: 'standard',
          name: 'Standard',
          price: 149,
          currency: 'ZAR',
          features: [
            'All courses',
            'Unlimited practice',
            'Project templates',
            'Community access',
            'Email support'
          ]
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 299,
          currency: 'ZAR',
          features: [
            'All Standard features',
            'Certification included',
            '1-on-1 mentorship',
            'Priority support',
            'Job board access'
          ]
        }
      ],
      billingCycle: 'monthly',
      trialDays: 14
    }
  },

  cupfinal: {
    id: 'cupfinal',
    name: 'Cup Final',
    description: 'Sports Platform & Fan Engagement',
    category: ProductCategory.SUBSCRIPTION,
    icon: '⚽',
    status: 'coming-soon',
    subscription: {
      tiers: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          currency: 'ZAR',
          features: [
            'Match schedules',
            'Basic statistics',
            'News updates'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 79,
          currency: 'ZAR',
          features: [
            'All free features',
            'Live match updates',
            'Advanced statistics',
            'Fantasy leagues',
            'Ad-free experience'
          ]
        }
      ],
      billingCycle: 'monthly'
    }
  },

  // === IMPACT PRODUCTS ===

  umkhanyakude: {
    id: 'umkhanyakude',
    name: 'uMkhanyakude Schools',
    description: 'High School Information & Community Platform',
    category: ProductCategory.IMPACT,
    icon: '🏫',
    status: 'coming-soon',
    impact: {
      targetAudience: 'schools',
      sponsorable: true,
      requiresApproval: false,
      freeAccess: true
    }
  },

  // === CUSTOM PRODUCTS ===

  govcross: {
    id: 'govcross',
    name: 'Gov Cross Platform',
    description: 'Government Employee Relocation & Post Swapping',
    category: ProductCategory.CUSTOM,
    icon: '🏛️',
    status: 'coming-soon',
    custom: {
      isProjectBased: true,
      requiresContract: true,
      estimatedDuration: '6 months'
    }
  }
};

/**
 * Get product by ID
 */
export function getProduct(productId: string): ProductMetadata | undefined {
  return PRODUCTS[productId];
}

/**
 * Get all products
 */
export function getAllProducts(): ProductMetadata[] {
  return Object.values(PRODUCTS);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: ProductCategory): ProductMetadata[] {
  return getAllProducts().filter(p => p.category === category);
}

/**
 * Get products by status
 */
export function getProductsByStatus(status: ProductMetadata['status']): ProductMetadata[] {
  return getAllProducts().filter(p => p.status === status);
}

/**
 * Get subscription products only
 */
export function getSubscriptionProducts(): ProductMetadata[] {
  return getProductsByCategory(ProductCategory.SUBSCRIPTION);
}

/**
 * Get impact products only
 */
export function getImpactProducts(): ProductMetadata[] {
  return getProductsByCategory(ProductCategory.IMPACT);
}

/**
 * Get custom products only
 */
export function getCustomProducts(): ProductMetadata[] {
  return getProductsByCategory(ProductCategory.CUSTOM);
}

/**
 * Get active products only
 */
export function getActiveProducts(): ProductMetadata[] {
  return getProductsByStatus('active');
}

/**
 * Check if product requires subscription
 */
export function requiresSubscription(productId: string): boolean {
  const product = getProduct(productId);
  return product?.category === ProductCategory.SUBSCRIPTION;
}

/**
 * Check if product is sponsorable
 */
export function isSponsorable(productId: string): boolean {
  const product = getProduct(productId);
  return product?.impact?.sponsorable ?? false;
}

/**
 * Check if product has free access
 */
export function hasFreeAccess(productId: string): boolean {
  const product = getProduct(productId);
  
  // Impact products with free access
  if (product?.impact?.freeAccess) {
    return true;
  }
  
  // Subscription products with free tier
  if (product?.subscription?.tiers.some(t => t.price === 0)) {
    return true;
  }
  
  return false;
}

/**
 * Get product tier by ID
 */
export function getProductTier(productId: string, tierId: string): ProductTier | undefined {
  const product = getProduct(productId);
  return product?.subscription?.tiers.find(t => t.id === tierId);
}

/**
 * Get category label
 */
export function getCategoryLabel(category: ProductCategory): string {
  const labels: Record<ProductCategory, string> = {
    [ProductCategory.SUBSCRIPTION]: 'Subscription',
    [ProductCategory.IMPACT]: 'Impact Initiative',
    [ProductCategory.CUSTOM]: 'Custom Solution'
  };
  return labels[category];
}

/**
 * Get category description
 */
export function getCategoryDescription(category: ProductCategory): string {
  const descriptions: Record<ProductCategory, string> = {
    [ProductCategory.SUBSCRIPTION]: 'Paid subscription-based products with tiered access',
    [ProductCategory.IMPACT]: 'Sponsored or free-access impact initiatives for communities',
    [ProductCategory.CUSTOM]: 'Project-based custom solutions for organizations'
  };
  return descriptions[category];
}

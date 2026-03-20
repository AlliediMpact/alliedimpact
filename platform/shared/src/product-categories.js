"use strict";
/**
 * Product Categories
 *
 * Defines product metadata and categorization across the Allied iMpact platform.
 * Three business models: Subscription, Impact, Custom
 *
 * @package @allied-impact/shared
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTS = exports.ProductCategory = void 0;
exports.getProduct = getProduct;
exports.getAllProducts = getAllProducts;
exports.getProductsByCategory = getProductsByCategory;
exports.getProductsByStatus = getProductsByStatus;
exports.getSubscriptionProducts = getSubscriptionProducts;
exports.getImpactProducts = getImpactProducts;
exports.getCustomProducts = getCustomProducts;
exports.getActiveProducts = getActiveProducts;
exports.requiresSubscription = requiresSubscription;
exports.isSponsorable = isSponsorable;
exports.hasFreeAccess = hasFreeAccess;
exports.getProductTier = getProductTier;
exports.getCategoryLabel = getCategoryLabel;
exports.getCategoryDescription = getCategoryDescription;
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["SUBSCRIPTION"] = "subscription";
    ProductCategory["IMPACT"] = "impact";
    ProductCategory["CUSTOM"] = "custom"; // Project-based custom solutions
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
/**
 * Product Registry
 * Single source of truth for all Allied iMpact products
 */
exports.PRODUCTS = {
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
    myprojects: {
        id: 'myprojects',
        name: 'My Projects',
        description: 'Custom Solution Development Portal - Track Projects, Milestones & Payments',
        category: ProductCategory.CUSTOM,
        icon: '💼',
        url: process.env.NODE_ENV === 'production'
            ? 'https://myprojects.alliedimpact.com'
            : 'http://localhost:3006',
        status: 'beta',
        custom: {
            isProjectBased: true,
            requiresContract: true,
            estimatedDuration: 'Varies by project scope'
        }
    },
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
function getProduct(productId) {
    return exports.PRODUCTS[productId];
}
/**
 * Get all products
 */
function getAllProducts() {
    return Object.values(exports.PRODUCTS);
}
/**
 * Get products by category
 */
function getProductsByCategory(category) {
    return getAllProducts().filter(p => p.category === category);
}
/**
 * Get products by status
 */
function getProductsByStatus(status) {
    return getAllProducts().filter(p => p.status === status);
}
/**
 * Get subscription products only
 */
function getSubscriptionProducts() {
    return getProductsByCategory(ProductCategory.SUBSCRIPTION);
}
/**
 * Get impact products only
 */
function getImpactProducts() {
    return getProductsByCategory(ProductCategory.IMPACT);
}
/**
 * Get custom products only
 */
function getCustomProducts() {
    return getProductsByCategory(ProductCategory.CUSTOM);
}
/**
 * Get active products only
 */
function getActiveProducts() {
    return getProductsByStatus('active');
}
/**
 * Check if product requires subscription
 */
function requiresSubscription(productId) {
    const product = getProduct(productId);
    return product?.category === ProductCategory.SUBSCRIPTION;
}
/**
 * Check if product is sponsorable
 */
function isSponsorable(productId) {
    const product = getProduct(productId);
    return product?.impact?.sponsorable ?? false;
}
/**
 * Check if product has free access
 */
function hasFreeAccess(productId) {
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
function getProductTier(productId, tierId) {
    const product = getProduct(productId);
    return product?.subscription?.tiers.find(t => t.id === tierId);
}
/**
 * Get category label
 */
function getCategoryLabel(category) {
    const labels = {
        [ProductCategory.SUBSCRIPTION]: 'Subscription',
        [ProductCategory.IMPACT]: 'Impact Initiative',
        [ProductCategory.CUSTOM]: 'Custom Solution'
    };
    return labels[category];
}
/**
 * Get category description
 */
function getCategoryDescription(category) {
    const descriptions = {
        [ProductCategory.SUBSCRIPTION]: 'Paid subscription-based products with tiered access',
        [ProductCategory.IMPACT]: 'Sponsored or free-access impact initiatives for communities',
        [ProductCategory.CUSTOM]: 'Project-based custom solutions for organizations'
    };
    return descriptions[category];
}
//# sourceMappingURL=product-categories.js.map
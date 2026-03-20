/**
 * Product Categories
 *
 * Defines product metadata and categorization across the Allied iMpact platform.
 * Three business models: Subscription, Impact, Custom
 *
 * @package @allied-impact/shared
 */
export declare enum ProductCategory {
    SUBSCRIPTION = "subscription",// Paid subscription products
    IMPACT = "impact",// Sponsored/free impact initiatives
    CUSTOM = "custom"
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
    subscription?: {
        tiers: ProductTier[];
        billingCycle: 'monthly' | 'yearly' | 'one-time';
        trialDays?: number;
    };
    impact?: {
        targetAudience: 'youth' | 'schools' | 'community' | 'all';
        sponsorable: boolean;
        requiresApproval: boolean;
        freeAccess: boolean;
    };
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
export declare const PRODUCTS: Record<string, ProductMetadata>;
/**
 * Get product by ID
 */
export declare function getProduct(productId: string): ProductMetadata | undefined;
/**
 * Get all products
 */
export declare function getAllProducts(): ProductMetadata[];
/**
 * Get products by category
 */
export declare function getProductsByCategory(category: ProductCategory): ProductMetadata[];
/**
 * Get products by status
 */
export declare function getProductsByStatus(status: ProductMetadata['status']): ProductMetadata[];
/**
 * Get subscription products only
 */
export declare function getSubscriptionProducts(): ProductMetadata[];
/**
 * Get impact products only
 */
export declare function getImpactProducts(): ProductMetadata[];
/**
 * Get custom products only
 */
export declare function getCustomProducts(): ProductMetadata[];
/**
 * Get active products only
 */
export declare function getActiveProducts(): ProductMetadata[];
/**
 * Check if product requires subscription
 */
export declare function requiresSubscription(productId: string): boolean;
/**
 * Check if product is sponsorable
 */
export declare function isSponsorable(productId: string): boolean;
/**
 * Check if product has free access
 */
export declare function hasFreeAccess(productId: string): boolean;
/**
 * Get product tier by ID
 */
export declare function getProductTier(productId: string, tierId: string): ProductTier | undefined;
/**
 * Get category label
 */
export declare function getCategoryLabel(category: ProductCategory): string;
/**
 * Get category description
 */
export declare function getCategoryDescription(category: ProductCategory): string;
//# sourceMappingURL=product-categories.d.ts.map
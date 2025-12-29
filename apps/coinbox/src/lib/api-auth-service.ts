/**
 * API Authentication Service
 * Handles API key generation, management, and validation
 */

import { db } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  keyHash: string;
  tier: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'revoked' | 'expired';
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastUsed?: Timestamp;
  };
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  revokedAt?: Timestamp;
  lastRotatedAt?: Timestamp;
}

export interface ApiKeyCreate {
  userId: string;
  name: string;
  tier?: 'basic' | 'pro' | 'enterprise';
  permissions?: string[];
  expiresInDays?: number;
}

export interface ApiKeyValidation {
  valid: boolean;
  apiKey?: ApiKey;
  error?: string;
}

// Rate limit tiers
const RATE_LIMITS = {
  basic: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
  },
  pro: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  enterprise: {
    requestsPerMinute: 1000,
    requestsPerHour: 10000,
    requestsPerDay: 100000,
  },
};

// Default permissions by tier
const DEFAULT_PERMISSIONS = {
  basic: ['read:loans', 'read:investments', 'read:transactions'],
  pro: [
    'read:loans',
    'read:investments',
    'read:transactions',
    'read:crypto',
    'write:loans',
    'write:investments',
  ],
  enterprise: [
    'read:*',
    'write:*',
    'admin:webhooks',
    'admin:api_keys',
  ],
};

/**
 * Generate a secure API key
 */
function generateApiKey(): { key: string; hash: string } {
  // Format: cb_live_xxxxxxxxxxxxxxxxxxxxx (32 chars random)
  const randomBytes = crypto.randomBytes(24);
  const key = `cb_live_${randomBytes.toString('hex')}`;
  
  // Hash the key for storage
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  
  return { key, hash };
}

/**
 * Hash an API key for comparison
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Create a new API key
 */
export async function createApiKey(
  request: ApiKeyCreate
): Promise<{ apiKey: ApiKey; plainKey: string }> {
  const { userId, name, tier = 'basic', permissions, expiresInDays } = request;

  // Validate tier
  if (!['basic', 'pro', 'enterprise'].includes(tier)) {
    throw new Error('Invalid tier. Must be: basic, pro, or enterprise');
  }

  // Generate key
  const { key, hash } = generateApiKey();

  // Calculate expiration
  const expiresAt = expiresInDays
    ? Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
    : undefined;

  // Create API key document
  const apiKeyDoc: Omit<ApiKey, 'id'> = {
    userId,
    name,
    key: '', // Don't store plain key
    keyHash: hash,
    tier,
    status: 'active',
    permissions: permissions || DEFAULT_PERMISSIONS[tier],
    rateLimit: RATE_LIMITS[tier],
    usage: {
      totalRequests: 0,
    },
    createdAt: Timestamp.now(),
    expiresAt,
  };

  // Save to database
  const docRef = await db.collection('apiKeys').add(apiKeyDoc);
  const id = docRef.id;

  const apiKey: ApiKey = {
    id,
    ...apiKeyDoc,
  };

  // Log creation
  await logApiKeyEvent({
    apiKeyId: id,
    userId,
    event: 'created',
    metadata: { name, tier },
  });

  return { apiKey, plainKey: key };
}

/**
 * Validate an API key
 */
export async function validateApiKey(key: string): Promise<ApiKeyValidation> {
  try {
    // Validate format
    if (!key || !key.startsWith('cb_live_')) {
      return {
        valid: false,
        error: 'Invalid API key format',
      };
    }

    // Hash the key
    const hash = hashApiKey(key);

    // Find API key by hash
    const snapshot = await db
      .collection('apiKeys')
      .where('keyHash', '==', hash)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        valid: false,
        error: 'API key not found',
      };
    }

    const doc = snapshot.docs[0];
    const apiKey = { id: doc.id, ...doc.data() } as ApiKey;

    // Check status
    if (apiKey.status !== 'active') {
      return {
        valid: false,
        error: `API key is ${apiKey.status}`,
      };
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt.toMillis() < Date.now()) {
      // Auto-revoke expired key
      await revokeApiKey(apiKey.id);
      return {
        valid: false,
        error: 'API key has expired',
      };
    }

    // Update last used timestamp
    await doc.ref.update({
      'usage.lastUsed': Timestamp.now(),
    });

    return {
      valid: true,
      apiKey,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Validation failed',
    };
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(apiKeyId: string): Promise<void> {
  const docRef = db.collection('apiKeys').doc(apiKeyId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error('API key not found');
  }

  const apiKey = doc.data() as ApiKey;

  await docRef.update({
    status: 'revoked',
    revokedAt: Timestamp.now(),
  });

  // Log revocation
  await logApiKeyEvent({
    apiKeyId,
    userId: apiKey.userId,
    event: 'revoked',
  });
}

/**
 * Rotate an API key (create new, revoke old)
 */
export async function rotateApiKey(
  apiKeyId: string
): Promise<{ apiKey: ApiKey; plainKey: string }> {
  const docRef = db.collection('apiKeys').doc(apiKeyId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error('API key not found');
  }

  const oldApiKey = doc.data() as ApiKey;

  // Create new key with same settings
  const newKeyResult = await createApiKey({
    userId: oldApiKey.userId,
    name: `${oldApiKey.name} (Rotated)`,
    tier: oldApiKey.tier,
    permissions: oldApiKey.permissions,
  });

  // Revoke old key
  await revokeApiKey(apiKeyId);

  // Log rotation
  await logApiKeyEvent({
    apiKeyId: newKeyResult.apiKey.id,
    userId: oldApiKey.userId,
    event: 'rotated',
    metadata: { oldKeyId: apiKeyId },
  });

  return newKeyResult;
}

/**
 * List API keys for a user
 */
export async function listApiKeys(
  userId: string,
  options?: {
    status?: 'active' | 'revoked' | 'expired';
    limit?: number;
  }
): Promise<ApiKey[]> {
  let query = db.collection('apiKeys').where('userId', '==', userId);

  if (options?.status) {
    query = query.where('status', '==', options.status);
  }

  query = query.orderBy('createdAt', 'desc');

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ApiKey[];
}

/**
 * Get API key details by ID
 */
export async function getApiKey(apiKeyId: string): Promise<ApiKey | null> {
  const doc = await db.collection('apiKeys').doc(apiKeyId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as ApiKey;
}

/**
 * Update API key (name, permissions, tier)
 */
export async function updateApiKey(
  apiKeyId: string,
  updates: {
    name?: string;
    permissions?: string[];
    tier?: 'basic' | 'pro' | 'enterprise';
  }
): Promise<void> {
  const docRef = db.collection('apiKeys').doc(apiKeyId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error('API key not found');
  }

  const updateData: any = {};

  if (updates.name) {
    updateData.name = updates.name;
  }

  if (updates.permissions) {
    updateData.permissions = updates.permissions;
  }

  if (updates.tier) {
    updateData.tier = updates.tier;
    updateData.rateLimit = RATE_LIMITS[updates.tier];
  }

  await docRef.update(updateData);

  const apiKey = doc.data() as ApiKey;

  // Log update
  await logApiKeyEvent({
    apiKeyId,
    userId: apiKey.userId,
    event: 'updated',
    metadata: updates,
  });
}

/**
 * Increment API key usage
 */
export async function incrementApiKeyUsage(apiKeyId: string): Promise<void> {
  await db.collection('apiKeys').doc(apiKeyId).update({
    'usage.totalRequests': FieldValue.increment(1),
    'usage.lastUsed': Timestamp.now(),
  });
}

/**
 * Get API key usage statistics
 */
export async function getApiKeyUsage(
  apiKeyId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{
  totalRequests: number;
  requestsInRange?: number;
  lastUsed?: Date;
}> {
  const apiKey = await getApiKey(apiKeyId);

  if (!apiKey) {
    throw new Error('API key not found');
  }

  const result: any = {
    totalRequests: apiKey.usage.totalRequests,
    lastUsed: apiKey.usage.lastUsed?.toDate(),
  };

  if (timeRange) {
    // Query request logs for range
    const snapshot = await db
      .collection('apiRequestLogs')
      .where('apiKeyId', '==', apiKeyId)
      .where('timestamp', '>=', Timestamp.fromDate(timeRange.start))
      .where('timestamp', '<=', Timestamp.fromDate(timeRange.end))
      .count()
      .get();

    result.requestsInRange = snapshot.data().count;
  }

  return result;
}

/**
 * Check if API key has permission
 */
export function hasPermission(apiKey: ApiKey, permission: string): boolean {
  // Check for wildcard permissions
  if (apiKey.permissions.includes('*') || apiKey.permissions.includes('admin:*')) {
    return true;
  }

  // Check for resource wildcard (e.g., "read:*")
  const [action, resource] = permission.split(':');
  if (apiKey.permissions.includes(`${action}:*`)) {
    return true;
  }

  // Check exact permission
  return apiKey.permissions.includes(permission);
}

/**
 * Log API key event
 */
async function logApiKeyEvent(event: {
  apiKeyId: string;
  userId: string;
  event: 'created' | 'revoked' | 'rotated' | 'updated' | 'validated';
  metadata?: any;
}): Promise<void> {
  await db.collection('apiKeyEvents').add({
    ...event,
    timestamp: Timestamp.now(),
  });
}

/**
 * Cleanup expired API keys (cron job)
 */
export async function cleanupExpiredApiKeys(): Promise<number> {
  const now = Timestamp.now();

  const snapshot = await db
    .collection('apiKeys')
    .where('status', '==', 'active')
    .where('expiresAt', '<=', now)
    .get();

  let count = 0;
  const batch = db.batch();

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      status: 'expired',
    });
    count++;
  });

  await batch.commit();

  return count;
}

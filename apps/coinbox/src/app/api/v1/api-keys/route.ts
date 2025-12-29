// GET /api/v1/api-keys - List user's API keys
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listApiKeys } from '@/lib/api-auth-service';
import { apiSuccess, apiError } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const includeRevoked = searchParams.get('includeRevoked') === 'true';

    const keys = await listApiKeys(session.user.id, includeRevoked);

    // Don't return the hashed keys or sensitive data
    const sanitizedKeys = keys.map(key => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      tier: key.tier,
      permissions: key.permissions,
      status: key.status,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      requestCount: key.requestCount,
    }));

    return apiSuccess({
      keys: sanitizedKeys,
      total: sanitizedKeys.length,
      active: sanitizedKeys.filter(k => k.status === 'active').length,
      revoked: sanitizedKeys.filter(k => k.status === 'revoked').length,
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return apiError('Failed to list API keys', 500);
  }
}

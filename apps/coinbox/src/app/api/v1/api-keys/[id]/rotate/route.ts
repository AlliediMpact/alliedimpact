// POST /api/v1/api-keys/:id/rotate - Rotate API key
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { rotateApiKey } from '@/lib/api-auth-service';
import { apiSuccess, apiError } from '@/lib/api-middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const keyDoc = await db.collection('apiKeys').doc(params.id).get();

    if (!keyDoc.exists) {
      return apiError('API key not found', 404);
    }

    const keyData = keyDoc.data();

    // Verify ownership
    if (keyData?.userId !== session.user.id) {
      return apiError('Forbidden', 403);
    }

    // Check if key is active
    if (keyData?.status !== 'active') {
      return apiError('Cannot rotate inactive API key', 400);
    }

    const result = await rotateApiKey(params.id);

    return apiSuccess({
      message: 'API key rotated successfully',
      newKey: {
        id: result.apiKey.id,
        key: result.plainKey, // Only returned once!
        keyPrefix: result.apiKey.keyHash?.substring(0, 4) || '',
        name: result.apiKey.name,
        tier: result.apiKey.tier,
        permissions: result.apiKey.permissions,
        expiresAt: result.apiKey.expiresAt,
      },
      warning: 'This is the only time the new key will be shown. Please store it securely.',
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    return apiError('Failed to rotate API key', 500);
  }
}

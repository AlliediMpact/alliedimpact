// GET /api/v1/api-keys/:id - Get specific key details
// PUT /api/v1/api-keys/:id - Update API key
// DELETE /api/v1/api-keys/:id - Revoke API key
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { revokeApiKey } from '@/lib/api-auth-service';
import { apiSuccess, apiError } from '@/lib/api-middleware';

export async function GET(
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

    // Don't return sensitive data
    const sanitizedKey = {
      id: keyDoc.id,
      name: keyData.name,
      keyPrefix: keyData.keyPrefix,
      tier: keyData.tier,
      permissions: keyData.permissions,
      status: keyData.status,
      createdAt: keyData.createdAt,
      expiresAt: keyData.expiresAt,
      lastUsedAt: keyData.lastUsedAt,
      requestCount: keyData.requestCount,
      metadata: keyData.metadata,
    };

    return apiSuccess({ key: sanitizedKey });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return apiError('Failed to fetch API key', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, permissions } = body;

    const keyRef = db.collection('apiKeys').doc(params.id);
    const keyDoc = await keyRef.get();

    if (!keyDoc.exists) {
      return apiError('API key not found', 404);
    }

    const keyData = keyDoc.data();

    // Verify ownership
    if (keyData?.userId !== session.user.id) {
      return apiError('Forbidden', 403);
    }

    // Validate updates
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return apiError('Invalid name', 400);
      }
      updates.name = name.trim();
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return apiError('Permissions must be an array', 400);
      }
      updates.permissions = permissions;
    }

    await keyRef.update(updates);

    // Log the update
    await db.collection('apiKeyEvents').add({
      keyId: params.id,
      userId: session.user.id,
      event: 'key_updated',
      changes: updates,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    return apiSuccess({ message: 'API key updated successfully' });
  } catch (error) {
    console.error('Error updating API key:', error);
    return apiError('Failed to update API key', 500);
  }
}

export async function DELETE(
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

    await revokeApiKey(params.id, 'user_request');

    return apiSuccess({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return apiError('Failed to revoke API key', 500);
  }
}

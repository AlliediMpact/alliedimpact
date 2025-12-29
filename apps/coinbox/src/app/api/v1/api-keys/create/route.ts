import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { createApiKey } from '@/lib/api-auth-service';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { name, tier, permissions, expiresInDays } = body;

    // Validate name
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'API key name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate tier
    if (tier && !['basic', 'pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: basic, pro, or enterprise' },
        { status: 400 }
      );
    }

    // Validate expiration
    if (expiresInDays && (expiresInDays < 1 || expiresInDays > 365)) {
      return NextResponse.json(
        { error: 'Expiration must be between 1 and 365 days' },
        { status: 400 }
      );
    }

    // Create API key
    const result = await createApiKey({
      userId,
      name: name.trim(),
      tier: tier || 'basic',
      permissions,
      expiresInDays,
    });

    // Return API key (this is the only time the plain key is visible)
    return NextResponse.json(
      {
        success: true,
        apiKey: {
          id: result.apiKey.id,
          name: result.apiKey.name,
          key: result.plainKey, // Plain API key - show once!
          tier: result.apiKey.tier,
          permissions: result.apiKey.permissions,
          rateLimit: result.apiKey.rateLimit,
          createdAt: result.apiKey.createdAt.toDate().toISOString(),
          expiresAt: result.apiKey.expiresAt?.toDate().toISOString(),
        },
        warning: 'This is the only time you will see the full API key. Store it securely!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API key creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    );
  }
}

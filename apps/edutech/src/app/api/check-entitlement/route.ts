import { NextRequest, NextResponse } from 'next/server';
import { hasProductAccess } from '@allied-impact/entitlements';

/**
 * GET /api/check-entitlement
 * Check if user has access to EduTech product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId') || 'edu-tech';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Check if user has product access using platform entitlements package
    const hasAccess = await hasProductAccess(userId, productId as any);

    return NextResponse.json({
      success: true,
      hasAccess,
      productId,
    });
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return NextResponse.json(
      { error: 'Failed to check entitlement' },
      { status: 500 }
    );
  }
}

/**
 * P2P Crypto API - Release Crypto
 * POST /api/p2p-crypto/release-crypto
 */

import { NextRequest, NextResponse } from 'next/server';
import { P2PCryptoService } from '@/lib/p2p-crypto/service';
import { requireAuth } from '@/lib/p2p-auth-helper';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction ID is required',
        },
        { status: 400 }
      );
    }

    const result = await P2PCryptoService.releaseCrypto({
      transactionId,
      userId: user.uid,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Crypto released successfully',
    });
  } catch (error) {
    console.error('Release crypto API error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to release crypto',
      },
      { status: 500 }
    );
  }
}

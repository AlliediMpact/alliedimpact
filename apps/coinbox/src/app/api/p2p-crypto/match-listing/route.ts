/**
 * P2P Crypto API - Match with Listing
 * POST /api/p2p-crypto/match-listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { P2PCryptoService } from '@/lib/p2p-crypto/service';
import { requireAuth } from '@/lib/p2p-auth-helper';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing ID is required',
        },
        { status: 400 }
      );
    }

    const result = await P2PCryptoService.matchWithListing({
      listingId,
      userId: user.uid,
      userName: user.displayName,
      userTier: user.membershipTier,
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
      transactionId: result.transactionId,
      message: 'Successfully matched with listing',
    });
  } catch (error) {
    console.error('Match listing API error:', error);
    
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
        error: 'Failed to match with listing',
      },
      { status: 500 }
    );
  }
}

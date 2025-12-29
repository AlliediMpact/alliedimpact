/**
 * P2P Crypto API - Create Listing
 * POST /api/p2p-crypto/create-listing
 */

import { NextRequest, NextResponse } from 'next/server';
import { P2PCryptoService } from '@/lib/p2p-crypto/service';
import { P2PCryptoAsset } from '@/lib/p2p-limits';
import { requireAuth } from '@/lib/p2p-auth-helper';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    const body = await request.json();
    const { type, asset, cryptoAmount, pricePerUnit, paymentMethod, terms } = body;

    // Validation
    if (!type || !asset || !cryptoAmount || !pricePerUnit || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid trade type. Must be "buy" or "sell"',
        },
        { status: 400 }
      );
    }

    // Validate amounts
    if (cryptoAmount <= 0 || pricePerUnit <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Crypto amount and price must be positive',
        },
        { status: 400 }
      );
    }

    // Create listing using authenticated user
    const result = await P2PCryptoService.createListing({
      userId: user.uid,
      userName: user.displayName,
      userTier: user.membershipTier,
      type,
      asset: asset as P2PCryptoAsset,
      cryptoAmount: parseFloat(cryptoAmount),
      pricePerUnit: parseFloat(pricePerUnit),
      paymentMethod,
      terms: terms || '',
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
      listingId: result.listingId,
      message: 'Listing created successfully',
    });
  } catch (error) {
    console.error('Create listing API error:', error);
    
    // Handle authentication errors
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
        error: 'Failed to create listing',
      },
      { status: 500 }
    );
  }
}

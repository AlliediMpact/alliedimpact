/**
 * P2P Crypto API - Get Listings
 * GET /api/p2p-crypto/listings
 */

import { NextRequest, NextResponse } from 'next/server';
import { P2PCryptoService } from '@/lib/p2p-crypto/service';
import { P2PCryptoAsset } from '@/lib/p2p-limits';
import { checkRateLimit, rateLimitResponse } from '@/lib/crypto-rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limit by IP for public endpoint
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = await checkRateLimit(request, ip);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetTime);
    }

    const searchParams = request.nextUrl.searchParams;
    const asset = searchParams.get('asset') as P2PCryptoAsset | null;
    const type = searchParams.get('type') as 'buy' | 'sell' | null;
    const limit = searchParams.get('limit');

    const listings = await P2PCryptoService.getActiveListings({
      asset: asset || undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      success: true,
      listings,
      count: listings.length,
    });
  } catch (error) {
    console.error('Get listings API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}

/**
 * P2P Crypto API - Get AI Predictions
 * GET /api/p2p-crypto/predictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIPredictionService } from '@/lib/ai-prediction-service';
import { P2PCryptoAsset } from '@/lib/p2p-limits';
import { verifyAuthentication } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication to prevent quota abuse
    const user = await verifyAuthentication(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const asset = searchParams.get('asset') as P2PCryptoAsset | null;
    const timeframe = searchParams.get('timeframe') as '1h' | '24h' | '7d' | null;

    if (asset) {
      // Get prediction for specific asset
      const prediction = await AIPredictionService.getPrediction(
        asset,
        timeframe || '24h'
      );

      return NextResponse.json({
        success: true,
        prediction,
      });
    } else {
      // Get predictions for all assets
      const predictions = await AIPredictionService.getAllPredictions(
        timeframe || '24h'
      );

      return NextResponse.json({
        success: true,
        predictions,
      });
    }
  } catch (error) {
    console.error('Get predictions API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch predictions',
      },
      { status: 500 }
    );
  }
}

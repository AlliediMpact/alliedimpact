import { NextRequest, NextResponse } from 'next/server';
import { getMatchesForIndividual, getMatchesForCompany } from '@/lib/matching-engine';

/**
 * GET /api/matches
 * Get matches for user (individual or company)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const userType = searchParams.get('userType') as 'individual' | 'company';
    const tier = searchParams.get('tier') as 'free' | 'entry' | 'classic' || 'free';

    if (!uid || !userType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // TODO: Verify auth

    let matches;
    if (userType === 'individual') {
      matches = await getMatchesForIndividual(uid, tier);
    } else {
      matches = await getMatchesForCompany(uid, tier);
    }

    // Apply tier-based filtering
    let responseData;
    if (tier === 'free') {
      // Free tier: only return count
      responseData = {
        count: matches.length,
        matches: null, // No match data
      };
    } else if (tier === 'entry') {
      // Entry tier: limited matches
      responseData = {
        count: matches.length,
        matches: matches.slice(0, 10),
        limit: 10,
        remaining: Math.max(0, 10 - matches.length),
      };
    } else {
      // Classic tier: unlimited
      responseData = {
        count: matches.length,
        matches: matches,
        limit: 'unlimited',
      };
    }

    return NextResponse.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    return NextResponse.json(
      { error: 'Failed to get matches' },
      { status: 500 }
    );
  }
}

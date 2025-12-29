/**
 * Savings Jar History API
 * 
 * GET: Get transaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import { savingsJarService } from '@/lib/savings-jar-service';
import { auth } from '@/lib/firebase-admin';
import { isFeatureEnabled } from '@/lib/features';

export async function GET(request: NextRequest) {
  try {
    // Check if feature is enabled
    if (!isFeatureEnabled('SAVINGS_JAR')) {
      return NextResponse.json(
        { error: 'Savings Jar feature is not enabled' },
        { status: 403 }
      );
    }

    // Get user from auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get transaction history
    const history = await savingsJarService.getHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error: any) {
    console.error('Error getting savings jar history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get history' },
      { status: 500 }
    );
  }
}

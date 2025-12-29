/**
 * Savings Jar Settings API
 * 
 * PUT: Update auto-threshold setting
 */

import { NextRequest, NextResponse } from 'next/server';
import { savingsJarService } from '@/lib/savings-jar-service';
import { auth } from '@/lib/firebase-admin';
import { isFeatureEnabled, SAVINGS_JAR_CONFIG } from '@/lib/features';

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { threshold } = body;

    // Validate input
    if (!threshold || threshold < SAVINGS_JAR_CONFIG.MIN_THRESHOLD) {
      return NextResponse.json(
        { error: `Threshold must be at least R${SAVINGS_JAR_CONFIG.MIN_THRESHOLD}` },
        { status: 400 }
      );
    }

    // Update threshold
    await savingsJarService.updateThreshold(userId, threshold);

    return NextResponse.json({
      success: true,
      message: `Auto-threshold updated to R${threshold}`,
    });
  } catch (error: any) {
    console.error('Error updating savings jar settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

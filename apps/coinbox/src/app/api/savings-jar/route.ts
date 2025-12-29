/**
 * Savings Jar API - Main Route
 * 
 * GET: Get savings jar details and balance
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

    // Get savings jar details
    const savingsJar = await savingsJarService.getSavingsJar(userId);

    if (!savingsJar) {
      // Initialize if doesn't exist
      await savingsJarService.initializeSavingsJar(userId);
      const newJar = await savingsJarService.getSavingsJar(userId);
      
      return NextResponse.json({
        success: true,
        data: newJar,
      });
    }

    return NextResponse.json({
      success: true,
      data: savingsJar,
    });
  } catch (error: any) {
    console.error('Error getting savings jar:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get savings jar' },
      { status: 500 }
    );
  }
}

/**
 * Savings Jar Deposit API
 * 
 * POST: Manual deposit to savings jar
 */

import { NextRequest, NextResponse } from 'next/server';
import { savingsJarService } from '@/lib/savings-jar-service';
import { auth } from '@/lib/firebase-admin';
import { isFeatureEnabled } from '@/lib/features';

export async function POST(request: NextRequest) {
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
    const { amount, operationId } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!operationId) {
      return NextResponse.json(
        { error: 'Operation ID is required' },
        { status: 400 }
      );
    }

    // Process deposit
    const result = await savingsJarService.manualDeposit(
      userId,
      amount,
      operationId
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error depositing to savings jar:', error);
    
    // Check if operation already exists
    if (error.message?.includes('already completed')) {
      return NextResponse.json(
        { error: 'This deposit has already been processed' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to deposit' },
      { status: 500 }
    );
  }
}

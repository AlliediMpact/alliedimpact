import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/firebase-admin';

/**
 * POST /api/mfa/disable
 * 
 * Disable MFA for a user
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Disable MFA and clear secret/backup codes
    await db.collection('users').doc(userId).update({
      mfaEnabled: false,
      mfaSecret: null,
      backupCodes: [],
      mfaDisabledAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disable MFA error:', error);
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}

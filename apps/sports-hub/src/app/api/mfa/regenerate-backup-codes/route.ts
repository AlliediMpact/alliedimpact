import { NextRequest, NextResponse } from 'next/server';
import { generateBackupCodes } from '@/lib/mfa';
import { db } from '@/config/firebase-admin';

/**
 * POST /api/mfa/regenerate-backup-codes
 * 
 * Regenerate backup codes for a user
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

    // Check if MFA is enabled
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    if (!userData?.mfaEnabled) {
      return NextResponse.json(
        { error: 'MFA is not enabled for this user' },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);

    // Update backup codes in Firestore
    await db.collection('users').doc(userId).update({
      backupCodes: backupCodes,
      backupCodesRegeneratedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      backupCodes: backupCodes.map((bc) => bc.code),
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    );
  }
}

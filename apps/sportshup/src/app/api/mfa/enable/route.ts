import { NextRequest, NextResponse } from 'next/server';
import { generateMFASecret, generateBackupCodes } from '@/lib/mfa';
import { auth, db } from '@/config/firebase-admin';

/**
 * POST /api/mfa/enable
 * 
 * Generate MFA secret and backup codes for a user
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

    // Get user details
    const user = await auth.getUser(userId);
    
    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate MFA secret and QR code
    const mfaSecret = await generateMFASecret(user.email);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Store MFA secret and backup codes in Firestore (not yet enabled)
    await db.collection('users').doc(userId).set(
      {
        mfaSecret: mfaSecret.secret,
        mfaEnabled: false, // Not enabled until verified
        backupCodes: backupCodes,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      qrCode: mfaSecret.qrCode,
      secret: mfaSecret.secret,
      backupCodes: backupCodes.map((bc) => bc.code),
    });
  } catch (error) {
    console.error('Enable MFA error:', error);
    return NextResponse.json(
      { error: 'Failed to enable MFA' },
      { status: 500 }
    );
  }
}

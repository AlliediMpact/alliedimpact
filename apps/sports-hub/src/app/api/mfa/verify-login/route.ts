import { NextRequest, NextResponse } from 'next/server';
import { verifyMFAToken, verifyBackupCode } from '@/lib/mfa';
import { db } from '@/config/firebase-admin';

/**
 * POST /api/mfa/verify-login
 * 
 * Verify MFA token or backup code during login
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, token, isBackupCode } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    // Get user's MFA data from Firestore
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

    let valid = false;

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = userData.backupCodes || [];
      const result = verifyBackupCode(token, backupCodes);
      
      if (result.valid) {
        // Mark backup code as used
        backupCodes[result.index].used = true;
        
        await db.collection('users').doc(userId).update({
          backupCodes: backupCodes,
          lastBackupCodeUsedAt: new Date(),
          updatedAt: new Date(),
        });
        
        valid = true;
      }
    } else {
      // Verify TOTP token
      const mfaSecret = userData.mfaSecret;
      
      if (!mfaSecret) {
        return NextResponse.json(
          { error: 'MFA secret not found' },
          { status: 400 }
        );
      }
      
      valid = verifyMFAToken(token, mfaSecret);
    }

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid token or backup code' },
        { status: 401 }
      );
    }

    // Update last verified timestamp
    await db.collection('users').doc(userId).update({
      lastMfaVerifiedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify login MFA error:', error);
    return NextResponse.json(
      { error: 'Failed to verify MFA' },
      { status: 500 }
    );
  }
}

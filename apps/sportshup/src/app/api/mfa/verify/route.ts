import { NextRequest, NextResponse } from 'next/server';
import { verifyMFAToken } from '@/lib/mfa';
import { db } from '@/config/firebase-admin';

/**
 * POST /api/mfa/verify
 * 
 * Verify MFA token and enable MFA if valid
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'User ID and token are required' },
        { status: 400 }
      );
    }

    // Get user's MFA secret from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const mfaSecret = userData?.mfaSecret;

    if (!mfaSecret) {
      return NextResponse.json(
        { error: 'MFA not set up for this user' },
        { status: 400 }
      );
    }

    // Verify token
    const valid = verifyMFAToken(token, mfaSecret);

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Enable MFA
    await db.collection('users').doc(userId).update({
      mfaEnabled: true,
      mfaVerifiedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify MFA error:', error);
    return NextResponse.json(
      { error: 'Failed to verify MFA' },
      { status: 500 }
    );
  }
}

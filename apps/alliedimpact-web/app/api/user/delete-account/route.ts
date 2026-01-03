import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@allied-impact/auth/admin';
import { Logger } from '@allied-impact/shared/logger';

const logger = Logger.create('delete-account-api');

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Require confirmation from request body
    const body = await request.json();
    if (body.confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation. Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    logger.info('Account deletion requested', { userId, email: decodedClaims.email });

    // TODO: Implement data deletion from Firestore collections
    // Example steps:
    // 1. Delete user profile from 'users' collection
    // 2. Delete subscriptions from 'subscriptions' collection
    // 3. Delete entitlements from 'entitlements' collection
    // 4. Anonymize transaction history (keep for legal/accounting requirements)
    // 5. Cancel active subscriptions with payment providers
    // 6. Finally, delete Firebase Auth user

    // For now, just delete the Firebase Auth user
    await getAuth().deleteUser(userId);

    logger.info('Account deleted successfully', { userId });

    // Clear session cookie
    const response = NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
    response.cookies.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Failed to delete account', { error });
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@allied-impact/auth/admin';
import { Logger } from '@allied-impact/shared/logger';

const logger = Logger.create('export-data-api');

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    logger.info('Data export requested', { userId });

    // Collect user data from various sources
    const userData: any = {
      exportDate: new Date().toISOString(),
      userId,
      personalInfo: {
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
        displayName: decodedClaims.name,
        createdAt: decodedClaims.auth_time ? new Date(decodedClaims.auth_time * 1000).toISOString() : null,
      },
      accountData: {},
    };

    // TODO: Add queries to fetch user data from Firestore collections
    // Example:
    // - User profile from 'users' collection
    // - Subscriptions from 'subscriptions' collection
    // - Entitlements from 'entitlements' collection
    // - Transaction history from 'transactions' collection

    // For now, return basic auth data
    const jsonData = JSON.stringify(userData, null, 2);
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="alliedimpact-data-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    logger.error('Failed to export user data', { error });
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

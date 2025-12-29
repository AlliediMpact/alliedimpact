import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { cryptoBalanceService } from '@/lib/services/crypto-balance-service';
import type { CryptoAsset } from '@/lib/types/crypto-custody';
import { checkRateLimit, rateLimitResponse } from '@/lib/crypto-rate-limit';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// GET /api/crypto/balances?userId=xxx - Get user's crypto balances
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check rate limit
    const rateLimit = await checkRateLimit(request, userId);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetTime);
    }

    // Get all balances
    const balances = await cryptoBalanceService.getAllBalances(userId);

    return NextResponse.json({ balances });
  } catch (error: any) {
    console.error('Error fetching balances:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}

// POST /api/crypto/balances - Initialize wallet (first time setup)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { lunoAccountId } = body;

    if (!lunoAccountId) {
      return NextResponse.json(
        { error: 'lunoAccountId is required' },
        { status: 400 }
      );
    }

    // Initialize wallet
    const wallet = await cryptoBalanceService.initializeWallet(userId, lunoAccountId);

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (error: any) {
    console.error('Error initializing wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize wallet' },
      { status: 500 }
    );
  }
}

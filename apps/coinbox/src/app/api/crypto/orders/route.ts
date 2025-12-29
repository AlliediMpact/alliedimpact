import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { cryptoBalanceService } from '@/lib/services/crypto-balance-service';
import type { CryptoAsset } from '@/lib/types/crypto-custody';
import { checkRateLimit, rateLimitResponse } from '@/lib/crypto-rate-limit';
import { CreateOrderSchema, validateAndSanitize } from '@/lib/validation/crypto-schemas';

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

interface Order {
  id: string;
  userId: string;
  asset: CryptoAsset;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  remaining: number;
  filled: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'PARTIAL';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// GET /api/crypto/orders - Get order book or user's orders
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

    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset') as CryptoAsset;
    const status = searchParams.get('status');
    const myOrders = searchParams.get('myOrders') === 'true';

    const db = getFirestore();
    let ordersQuery = db.collection('cryptoOrders');

    // Filter by asset if provided
    if (asset) {
      ordersQuery = ordersQuery.where('asset', '==', asset) as any;
    }

    // Filter by status if provided
    if (status) {
      ordersQuery = ordersQuery.where('status', '==', status) as any;
    }

    // Filter by user if myOrders is true
    if (myOrders) {
      ordersQuery = ordersQuery.where('userId', '==', userId) as any;
    } else {
      // Only show pending orders in public order book
      ordersQuery = ordersQuery.where('status', '==', 'PENDING') as any;
    }

    // Order by price (ascending for buys, descending for sells)
    ordersQuery = ordersQuery.orderBy('price', 'desc') as any;
    ordersQuery = ordersQuery.limit(100) as any;

    const snapshot = await ordersQuery.get();
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
    }));

    // Separate into bids and asks
    const bids = orders.filter((o: any) => o.type === 'BUY');
    const asks = orders.filter((o: any) => o.type === 'SELL');

    return NextResponse.json({
      bids,
      asks,
      orders: myOrders ? orders : undefined,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/crypto/orders - Place a new order
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
    
    // Validate and sanitize input
    const validation = validateAndSanitize(CreateOrderSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }

    const { asset, type, price, amount } = validation.data;

    // Check balance
    if (type === 'SELL') {
      const balance = await cryptoBalanceService.getBalance(userId, asset);
      if (balance.trading < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Lock the balance
      await cryptoBalanceService.lockBalance({
        userId,
        asset,
        amount,
        orderId: '', // Will be set after order is created
        orderType: type,
      });
    }

    // TODO: Check ZAR balance for BUY orders

    // Create order
    const db = getFirestore();
    const orderRef = await db.collection('cryptoOrders').add({
      userId,
      asset,
      type,
      price,
      amount,
      remaining: amount,
      filled: 0,
      status: 'PENDING',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Update the lock with orderId
    if (type === 'SELL') {
      // Update the transaction metadata with orderId
      // (Already locked above, just need to track)
    }

    // TODO: Call matching engine to try to match immediately
    // await matchingEngine.matchOrder(orderRef.id);

    return NextResponse.json(
      { orderId: orderRef.id, message: 'Order placed successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}

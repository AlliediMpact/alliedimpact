import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { cryptoBalanceService } from '@/lib/services/crypto-balance-service';

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

// DELETE /api/crypto/orders/[orderId] - Cancel an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { orderId } = params;
    const db = getFirestore();

    // Get the order
    const orderDoc = await db.collection('cryptoOrders').doc(orderId).get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderDoc.data();

    // Check if user owns the order
    if (order?.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if order can be cancelled
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Order cannot be cancelled' },
        { status: 400 }
      );
    }

    // Unlock the balance if it's a sell order
    if (order.type === 'SELL' && order.remaining > 0) {
      await cryptoBalanceService.unlockBalance({
        userId,
        asset: order.asset,
        amount: order.remaining,
        orderId,
      });
    }

    // TODO: Unlock ZAR balance for buy orders

    // Update order status
    await db.collection('cryptoOrders').doc(orderId).update({
      status: 'CANCELLED',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

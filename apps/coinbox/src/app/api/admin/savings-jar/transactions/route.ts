import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get recent transactions
    const txSnapshot = await adminDb
      .collection('savingsJarTransactions')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const transactions = await Promise.all(
      txSnapshot.docs.map(async (doc) => {
        const txData = doc.data();
        const userId = txData.userId;
        
        // Get user email
        let userEmail = 'Unknown';
        try {
          const userRecord = await adminAuth.getUser(userId);
          userEmail = userRecord.email || 'No email';
        } catch (error) {
          // User might not exist
        }

        return {
          id: doc.id,
          userId,
          userEmail,
          type: txData.type,
          amount: txData.amount || 0,
          fee: txData.fee || 0,
          source: txData.source || 'unknown',
          createdAt: txData.createdAt?.toDate() || new Date(),
          status: txData.status || 'completed',
        };
      })
    );

    return NextResponse.json(transactions);

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

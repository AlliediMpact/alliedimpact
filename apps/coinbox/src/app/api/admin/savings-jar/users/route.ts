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

    // Get all savings jars
    const jarsSnapshot = await adminDb.collection('savingsJar').get();
    
    const users = await Promise.all(
      jarsSnapshot.docs.map(async (doc) => {
        const jarData = doc.data();
        const userId = doc.id;
        
        // Get user email
        let userEmail = 'Unknown';
        try {
          const userRecord = await adminAuth.getUser(userId);
          userEmail = userRecord.email || 'No email';
        } catch (error) {
          // User might not exist
        }

        return {
          userId,
          userEmail,
          balance: jarData.balance || 0,
          totalDeposited: jarData.totalDeposited || 0,
          totalWithdrawn: jarData.totalWithdrawn || 0,
          autoThreshold: jarData.autoThreshold || 100,
          createdAt: jarData.createdAt?.toDate() || new Date(),
          updatedAt: jarData.updatedAt?.toDate() || new Date(),
        };
      })
    );

    // Sort by balance descending
    users.sort((a, b) => b.balance - a.balance);

    return NextResponse.json(users);

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

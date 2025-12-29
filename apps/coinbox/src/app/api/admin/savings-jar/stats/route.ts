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

    // Get all stats
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all savings jars
    const jarsSnapshot = await adminDb.collection('savingsJar').get();
    const totalJars = jarsSnapshot.size;
    
    let totalBalance = 0;
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let activeUsers = 0;

    jarsSnapshot.forEach(doc => {
      const data = doc.data();
      totalBalance += data.balance || 0;
      totalDeposited += data.totalDeposited || 0;
      totalWithdrawn += data.totalWithdrawn || 0;
      if ((data.balance || 0) > 0) {
        activeUsers++;
      }
    });

    // Get transactions from last 24h
    const txSnapshot = await adminDb
      .collection('savingsJarTransactions')
      .where('createdAt', '>=', yesterday)
      .get();

    let last24hDeposits = 0;
    let last24hWithdrawals = 0;
    let totalFees = 0;

    txSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'withdrawal') {
        last24hWithdrawals += data.amount || 0;
        totalFees += data.fee || 0;
      } else {
        last24hDeposits += data.amount || 0;
      }
    });

    // Calculate all-time fees
    const allTxSnapshot = await adminDb
      .collection('savingsJarTransactions')
      .where('type', '==', 'withdrawal')
      .get();

    let allTimeFees = 0;
    allTxSnapshot.forEach(doc => {
      allTimeFees += doc.data().fee || 0;
    });

    const avgBalancePerUser = activeUsers > 0 ? totalBalance / activeUsers : 0;

    return NextResponse.json({
      totalJars,
      activeUsers,
      totalBalance,
      totalDeposited,
      totalWithdrawn,
      totalFees: allTimeFees,
      avgBalancePerUser,
      last24hDeposits,
      last24hWithdrawals,
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

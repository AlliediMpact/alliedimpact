import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface AnalyticsData {
  // Adoption metrics
  totalUsers: number;
  activeUsers: number;
  adoptionRate: number;
  
  // Financial metrics
  totalBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  avgBalancePerUser: number;
  
  // Trends
  depositTrends: TrendData[];
  withdrawalTrends: TrendData[];
  balanceTrends: TrendData[];
  
  // Revenue
  totalFeesCollected: number;
  avgFeePerWithdrawal: number;
  
  // User behavior
  avgDepositsPerUser: number;
  avgWithdrawalsPerUser: number;
  retentionRate: number;
}

export interface TrendData {
  date: string;
  value: number;
}

export async function getAnalytics(userId: string, days: number = 30): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get user's jar
  const jarDoc = await getDocs(
    query(collection(db, 'savingsJar'), where('__name__', '==', userId))
  );

  // Get transactions
  const txQuery = query(
    collection(db, 'savingsJarTransactions'),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(startDate))
  );
  const txSnapshot = await getDocs(txQuery);

  // Calculate metrics
  let totalDeposited = 0;
  let totalWithdrawn = 0;
  let totalFees = 0;
  let depositCount = 0;
  let withdrawalCount = 0;

  const depositsByDay: { [key: string]: number } = {};
  const withdrawalsByDay: { [key: string]: number } = {};

  txSnapshot.forEach((doc) => {
    const tx = doc.data();
    const date = tx.createdAt.toDate().toISOString().split('T')[0];

    if (tx.type === 'deposit') {
      totalDeposited += tx.amount;
      depositCount++;
      depositsByDay[date] = (depositsByDay[date] || 0) + tx.amount;
    } else if (tx.type === 'withdrawal') {
      totalWithdrawn += tx.amount;
      withdrawalCount++;
      totalFees += tx.fee || 0;
      withdrawalsByDay[date] = (withdrawalsByDay[date] || 0) + tx.amount;
    }
  });

  // Build trend data
  const depositTrends: TrendData[] = [];
  const withdrawalTrends: TrendData[] = [];
  const balanceTrends: TrendData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    depositTrends.push({
      date: dateStr,
      value: depositsByDay[dateStr] || 0,
    });

    withdrawalTrends.push({
      date: dateStr,
      value: withdrawalsByDay[dateStr] || 0,
    });
  }

  const currentBalance = jarDoc.empty ? 0 : jarDoc.docs[0].data().balance || 0;

  return {
    totalUsers: 1, // Single user view
    activeUsers: currentBalance > 0 ? 1 : 0,
    adoptionRate: 100, // Single user
    totalBalance: currentBalance,
    totalDeposited,
    totalWithdrawn,
    avgBalancePerUser: currentBalance,
    depositTrends,
    withdrawalTrends,
    balanceTrends,
    totalFeesCollected: totalFees,
    avgFeePerWithdrawal: withdrawalCount > 0 ? totalFees / withdrawalCount : 0,
    avgDepositsPerUser: depositCount,
    avgWithdrawalsPerUser: withdrawalCount,
    retentionRate: currentBalance > 0 ? 100 : 0,
  };
}

export async function getGlobalAnalytics(days: number = 30): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all jars
  const jarsSnapshot = await getDocs(collection(db, 'savingsJar'));
  
  let totalBalance = 0;
  let activeUsers = 0;
  let totalDeposited = 0;
  let totalWithdrawn = 0;

  jarsSnapshot.forEach((doc) => {
    const jar = doc.data();
    totalBalance += jar.balance || 0;
    totalDeposited += jar.totalDeposited || 0;
    totalWithdrawn += jar.totalWithdrawn || 0;
    if ((jar.balance || 0) > 0) {
      activeUsers++;
    }
  });

  // Get transactions
  const txQuery = query(
    collection(db, 'savingsJarTransactions'),
    where('createdAt', '>=', Timestamp.fromDate(startDate))
  );
  const txSnapshot = await getDocs(txQuery);

  let totalFees = 0;
  let depositCount = 0;
  let withdrawalCount = 0;

  const depositsByDay: { [key: string]: number } = {};
  const withdrawalsByDay: { [key: string]: number } = {};
  const balancesByDay: { [key: string]: number } = {};

  txSnapshot.forEach((doc) => {
    const tx = doc.data();
    const date = tx.createdAt.toDate().toISOString().split('T')[0];

    if (tx.type === 'deposit') {
      depositCount++;
      depositsByDay[date] = (depositsByDay[date] || 0) + tx.amount;
    } else if (tx.type === 'withdrawal') {
      withdrawalCount++;
      totalFees += tx.fee || 0;
      withdrawalsByDay[date] = (withdrawalsByDay[date] || 0) + tx.amount;
    }
  });

  // Build trend data
  const depositTrends: TrendData[] = [];
  const withdrawalTrends: TrendData[] = [];
  const balanceTrends: TrendData[] = [];

  let runningBalance = totalBalance;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    depositTrends.push({
      date: dateStr,
      value: depositsByDay[dateStr] || 0,
    });

    withdrawalTrends.push({
      date: dateStr,
      value: withdrawalsByDay[dateStr] || 0,
    });

    // Approximate balance trend
    balanceTrends.push({
      date: dateStr,
      value: runningBalance,
    });
  }

  const totalUsers = jarsSnapshot.size;
  const adoptionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  const avgBalancePerUser = activeUsers > 0 ? totalBalance / activeUsers : 0;

  return {
    totalUsers,
    activeUsers,
    adoptionRate,
    totalBalance,
    totalDeposited,
    totalWithdrawn,
    avgBalancePerUser,
    depositTrends,
    withdrawalTrends,
    balanceTrends,
    totalFeesCollected: totalFees,
    avgFeePerWithdrawal: withdrawalCount > 0 ? totalFees / withdrawalCount : 0,
    avgDepositsPerUser: depositCount / Math.max(totalUsers, 1),
    avgWithdrawalsPerUser: withdrawalCount / Math.max(totalUsers, 1),
    retentionRate: adoptionRate,
  };
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

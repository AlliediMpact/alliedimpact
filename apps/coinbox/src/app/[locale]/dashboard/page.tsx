'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, CreditCard, Home as HomeIcon, ReferralCode, Share2, Shield, Users, Wallet, BarChart3, Loader2, TrendingUp, TrendingDown, Activity, DollarSign, ArrowUpRight } from 'lucide-react';
import RiskAssessmentTool from "@/components/RiskAssessmentTool";
import SummaryComponent from "@/components/SummaryComponent";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  DashboardStatsGrid,
  DashboardStat,
  QuickAction,
  ActivityFeed,
  ChartContainer,
  FAB,
} from '@/components/ui';
import { AnimatedLineChart, Sparkline } from '@/components/ui/charts';
import { PageLoader } from '@/components/ui/loading-states';

const recentTransactions = [
  { id: 1, type: "Deposit", amount: "R1000", date: "2024-07-15" },
  { id: 2, type: "Withdrawal", amount: "R200", date: "2024-07-14" },
  { id: 3, type: "Loan", amount: "R300", date: "2024-07-12" },
];

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Use state to track mounting
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [commissionBalance, setCommissionBalance] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true); // Set to true after the component mounts
  }, []);

    // Fetch user-specific data (replace with your actual data fetching logic)
    useEffect(() => {
        const fetchBalances = async () => {
            if (user) {
                try {
                    const wallet = await getWalletBalance(user.uid);
                    const commission = await getCommissionBalance(user.uid);

                    setWalletBalance(wallet);
                    setCommissionBalance(commission);
                } catch (error) {
                    console.error('Error fetching balances:', error);
                    // Set default values on error
                    setWalletBalance(0);
                    setCommissionBalance(0);
                }
            }
        };
        fetchBalances();
    }, [user]);

  if (!isMounted || loading) {
    return <PageLoader />;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300
      }
    },
    hover: { 
      y: -5, 
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  // Mock data for charts (replace with real data)
  const revenueData = [
    { label: 'Mon', value: 1200 },
    { label: 'Tue', value: 1900 },
    { label: 'Wed', value: 1600 },
    { label: 'Thu', value: 2100 },
    { label: 'Fri', value: 1800 },
    { label: 'Sat', value: 2400 },
    { label: 'Sun', value: 2200 },
  ];

  const activities = [
    {
      id: '1',
      title: 'Investment Completed',
      description: 'Successfully invested R1,000 in BTC',
      timestamp: '2 hours ago',
      icon: <TrendingUp className="h-5 w-5" />,
      variant: 'success' as const,
    },
    {
      id: '2',
      title: 'Loan Approved',
      description: 'Your loan request of R5,000 was approved',
      timestamp: '5 hours ago',
      icon: <Shield className="h-5 w-5" />,
      variant: 'default' as const,
    },
    {
      id: '3',
      title: 'Withdrawal Processed',
      description: 'R200 withdrawal completed',
      timestamp: '1 day ago',
      icon: <Wallet className="h-5 w-5" />,
      variant: 'success' as const,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col p-6 space-y-6 dashboard">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Dashboard
            </motion.h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome back, {user.email?.split('@')[0]}!
            </motion.p>
          </div>
        </div>

        {/* PWA Install Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PWAInstallPrompt />
        </motion.div>

        {/* Stats Grid */}
        <DashboardStatsGrid columns={4}>
          <DashboardStat
            title="Wallet Balance"
            value={walletBalance !== null ? walletBalance : 0}
            change={12.5}
            changeLabel="vs last month"
            icon={<Wallet className="h-5 w-5" />}
            prefix="R"
            format="currency"
          />
          <DashboardStat
            title="Commission Balance"
            value={commissionBalance !== null ? commissionBalance : 0}
            change={8.3}
            changeLabel="vs last month"
            icon={<DollarSign className="h-5 w-5" />}
            prefix="R"
            format="currency"
          />
          <DashboardStat
            title="Total Transactions"
            value={recentTransactions.length}
            change={5}
            changeLabel="this week"
            icon={<Activity className="h-5 w-5" />}
            format="number"
          />
          <DashboardStat
            title="Growth"
            value={23.5}
            change={3.2}
            changeLabel="vs last month"
            icon={<TrendingUp className="h-5 w-5" />}
            suffix="%"
            format="percentage"
          />
        </DashboardStatsGrid>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              icon={<Coins className="h-5 w-5" />}
              label="Invest"
              onClick={() => router.push('/dashboard/trading')}
              variant="primary"
            />
            <QuickAction
              icon={<Wallet className="h-5 w-5" />}
              label="Borrow"
              onClick={() => router.push('/dashboard/trading')}
              variant="secondary"
            />
            <QuickAction
              icon={<Users className="h-5 w-5" />}
              label="P2P Crypto"
              onClick={() => router.push('/p2p-crypto/marketplace')}
              variant="success"
            />
            <QuickAction
              icon={<Share2 className="h-5 w-5" />}
              label="Refer Friend"
              onClick={() => router.push('/dashboard/referral')}
              variant="secondary"
            />
            <QuickAction
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              onClick={() => router.push('/dashboard/analytics')}
              variant="primary"
            />
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <ChartContainer
            title="Weekly Activity"
            subtitle="Your transaction activity this week"
            action={
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/analytics')}>
                View Details
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            }
          >
            <AnimatedLineChart
              data={revenueData}
              height={300}
              showGrid
              showTooltip
            />
          </ChartContainer>

          {/* Recent Activity Feed */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityFeed items={activities} />
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/transactions')}
                className="w-full"
              >
                View All Transactions
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Assessment */}
          <Card className="border-l-4 border-primary-blue">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary-blue" />
                Risk Assessment
              </CardTitle>
              <CardDescription>AI-driven risk assessment based on transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskAssessmentTool userId={user.uid} />
            </CardContent>
          </Card>

          {/* Text Summarization */}
          <Card className="border-l-4 border-primary-purple">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary-purple" />
                Text Summarization
              </CardTitle>
              <CardDescription>Summarize any text using AI</CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryComponent />
            </CardContent>
          </Card>
        </div>

        {/* Additional Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              More Features
            </CardTitle>
            <CardDescription>Access additional platform features</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={() => router.push('/dashboard/kyc')} 
              variant="outline" 
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <Shield className="mr-2 h-4 w-4" />
              KYC
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/support')} 
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Users className="mr-2 h-4 w-4" />
              Support
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/commissions')} 
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Coins className="mr-2 h-4 w-4" />
              Commissions
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/payments')} 
              variant="outline"
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Payments
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/settings')} 
              variant="outline"
              className="border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              <Shield className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              onClick={() => signOut()} 
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <FAB
          icon={<Coins className="h-6 w-6" />}
          label="Quick Trade"
          position="bottom-right"
          onClick={() => router.push('/dashboard/trading')}
        />
      </div>
    </ProtectedRoute>
  );
}

// Fetch wallet balance from Firestore
async function getWalletBalance(userId: string): Promise<number> {
    try {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore();
        const walletDoc = await getDoc(doc(db, 'wallets', userId));
        
        if (walletDoc.exists()) {
            const data = walletDoc.data();
            return parseFloat(data.balance?.toString() || '0');
        }
        return 0;
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return 0;
    }
}

// Fetch commission balance from Firestore
async function getCommissionBalance(userId: string): Promise<number> {
    try {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore();
        const commissionsDoc = await getDoc(doc(db, 'commissions', userId));
        
        if (commissionsDoc.exists()) {
            const data = commissionsDoc.data();
            return parseFloat(data.balance?.toString() || '0');
        }
        return 0;
    } catch (error) {
        console.error('Error fetching commission balance:', error);
        return 0;
    }
}

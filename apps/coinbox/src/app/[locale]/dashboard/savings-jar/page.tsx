'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PiggyBank, ArrowDown, ArrowUp, Settings, History } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SAVINGS_JAR_CONFIG } from '@/lib/features';

interface SavingsJar {
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  autoThreshold: number;
  createdAt: any;
  updatedAt: any;
}

interface Transaction {
  id: string;
  type: 'auto_deposit' | 'manual_deposit' | 'withdrawal';
  amount: number;
  fee?: number;
  source: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: any;
  status: string;
}

export default function SavingsJarPage() {
  const [savingsJar, setSavingsJar] = useState<SavingsJar | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [threshold, setThreshold] = useState('100');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSavingsJar();
    loadHistory();
  }, []);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  };

  const loadSavingsJar = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch('/api/savings-jar', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSavingsJar(data.data);
        setThreshold(data.data.autoThreshold.toString());
      }
    } catch (error: any) {
      console.error('Error loading savings jar:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load savings jar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch('/api/savings-jar/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleDeposit = async () => {
    try {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid amount',
          variant: 'destructive',
        });
        return;
      }

      setProcessing(true);
      const token = await getAuthToken();
      const operationId = `manual_deposit_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response = await fetch('/api/savings-jar/deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, operationId }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.data.message,
        });
        setDepositAmount('');
        await loadSavingsJar();
        await loadHistory();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Deposit Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid amount',
          variant: 'destructive',
        });
        return;
      }

      setProcessing(true);
      const token = await getAuthToken();
      const operationId = `withdrawal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response = await fetch('/api/savings-jar/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, operationId }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.data.message,
        });
        setWithdrawAmount('');
        await loadSavingsJar();
        await loadHistory();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      const newThreshold = parseFloat(threshold);
      if (isNaN(newThreshold) || newThreshold < SAVINGS_JAR_CONFIG.MIN_THRESHOLD) {
        toast({
          title: 'Invalid Threshold',
          description: `Minimum threshold is R${SAVINGS_JAR_CONFIG.MIN_THRESHOLD}`,
          variant: 'destructive',
        });
        return;
      }

      setProcessing(true);
      const token = await getAuthToken();

      const response = await fetch('/api/savings-jar/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threshold: newThreshold }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        await loadSavingsJar();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'auto_deposit':
        return 'Auto Save';
      case 'manual_deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'auto_deposit':
      case 'manual_deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const canWithdraw = savingsJar && savingsJar.balance >= savingsJar.autoThreshold;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <PiggyBank className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Savings Jar</h1>
          <p className="text-muted-foreground">Auto-save 1% from all profits</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-blue-900 dark:text-blue-100">
            {savingsJar ? formatCurrency(savingsJar.balance) : formatCurrency(0)}
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Current Balance
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Deposited</p>
            <p className="text-lg font-semibold">{savingsJar ? formatCurrency(savingsJar.totalDeposited) : formatCurrency(0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Withdrawn</p>
            <p className="text-lg font-semibold">{savingsJar ? formatCurrency(savingsJar.totalWithdrawn) : formatCurrency(0)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Deposit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="w-5 h-5 text-green-600" />
              Deposit
            </CardTitle>
            <CardDescription>Add money to your savings jar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount">Amount (ZAR)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="100.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={processing}
              />
            </div>
            <Button
              onClick={handleDeposit}
              disabled={processing || !depositAmount}
              className="w-full"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Deposit
            </Button>
          </CardContent>
        </Card>

        {/* Withdraw Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-blue-600" />
              Withdraw
            </CardTitle>
            <CardDescription>
              {canWithdraw 
                ? `Withdraw to main wallet (${SAVINGS_JAR_CONFIG.WITHDRAWAL_FEE * 100}% fee applies)` 
                : `Minimum balance of R${savingsJar?.autoThreshold || 100} required`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount">Amount (ZAR)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="100.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={processing || !canWithdraw}
              />
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={processing || !canWithdraw || !withdrawAmount}
              variant="outline"
              className="w-full"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Withdraw
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <CardDescription>Configure your savings jar preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="threshold">Minimum Balance for Withdrawal (ZAR)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                disabled={processing}
                min={SAVINGS_JAR_CONFIG.MIN_THRESHOLD}
              />
              <Button onClick={handleUpdateThreshold} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Minimum: R{SAVINGS_JAR_CONFIG.MIN_THRESHOLD} • Auto-save: {SAVINGS_JAR_CONFIG.AUTO_PERCENTAGE * 100}% of profits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Recent savings jar activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{formatDate(tx.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTransactionTypeLabel(tx.type)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{tx.source}</TableCell>
                      <TableCell className={`text-right font-medium ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {tx.fee ? formatCurrency(tx.fee) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(tx.balanceAfter)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">How it works:</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Automatically save {SAVINGS_JAR_CONFIG.AUTO_PERCENTAGE * 100}% from all profits (loans, crypto trades, referrals)</li>
            <li>• Manually add funds anytime to boost your savings</li>
            <li>• Withdraw when balance reaches R{savingsJar?.autoThreshold || 100} or more</li>
            <li>• {SAVINGS_JAR_CONFIG.WITHDRAWAL_FEE * 100}% withdrawal fee supports platform operations</li>
            <li>• Funds are separate from your main wallet and cannot be used as collateral</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

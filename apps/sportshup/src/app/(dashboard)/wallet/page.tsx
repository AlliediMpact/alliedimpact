'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Wallet as WalletIcon, Plus, Loader2, TrendingUp } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { Wallet } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { validateTopUpAmount, buildPayFastPaymentData, generatePayFastSignature, getPayFastUrl } from '@/lib/payfast';
import EnhancedWalletTransactions from '@/components/wallet/EnhancedWalletTransactions';

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000]; // R10, R20, R50, R100, R200, R500

export default function WalletPage() {
  const { currentUser, cupfinalUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch wallet data
  useEffect(() => {
    if (!currentUser) return;

    const fetchWalletData = async () => {
      try {
        // Fetch wallet balance
        const walletRef = doc(db, 'sportshub_wallets', currentUser.uid);
        const walletSnap = await getDoc(walletRef);
        
        if (walletSnap.exists()) {
          setWallet(walletSnap.data() as Wallet);
        } else {
          // Wallet will be created on first top-up
          setWallet(null);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [currentUser]);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setTopUpAmount((amount / 100).toFixed(2));
    setError('');
  };

  const handleCustomAmountChange = (value: string) => {
    setTopUpAmount(value);
    setSelectedPreset(null);
    setError('');
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const amountInCents = Math.round(parseFloat(topUpAmount) * 100);

      // Validate amount
      const validation = validateTopUpAmount(amountInCents);
      if (!validation.valid) {
        setError(validation.error || 'Invalid amount');
        setProcessing(false);
        return;
      }

      if (!currentUser || !cupfinalUser) {
        setError('User not authenticated');
        setProcessing(false);
        return;
      }

      // Build PayFast payment data
      const paymentData = buildPayFastPaymentData(
        currentUser.uid,
        amountInCents,
        currentUser.email!,
        cupfinalUser.displayName
      );

      // Generate signature
      const passphrase = process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE;
      const signature = generatePayFastSignature(paymentData as any, passphrase);

      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = getPayFastUrl();

      // Add all payment data as hidden inputs
      Object.entries({ ...paymentData, signature }).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error initiating top-up:', error);
      setError('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground">
            Top up your wallet to participate in SportsHub projects
          </p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-purple-600" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold text-purple-600">
                  {formatCurrency(wallet?.balanceInCents || 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Available for voting (R2 per vote)
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="topup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="topup">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Up Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Top Up Wallet
              </CardTitle>
              <CardDescription>
                Add funds to your CupFinal voting wallet (minimum R10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTopUp} className="space-y-6">
                {/* Preset Amounts */}
                <div>
                  <Label className="mb-3 block">Quick Select</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedPreset === amount ? 'default' : 'outline'}
                        onClick={() => handlePresetClick(amount)}
                        className="h-auto py-3"
                      >
                        <div>
                          <div className="font-bold">{formatCurrency(amount)}</div>
                          <div className="text-xs opacity-75">
                            {Math.floor(amount / 200)} votes
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <Label htmlFor="amount">Custom Amount</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="10"
                      placeholder="10.00"
                      value={topUpAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum R10 • No maximum limit
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={processing || !topUpAmount}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Top Up with PayFast
                    </>
                  )}
                </Button>

              Info Banner */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">💡 How Wallet Works</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Top up any amount from R10 (no maximum limit)</li>
                <li>• Use your balance across all SportsHub projects</li>
                <li>• Funds are deducted when you participate (e.g., R2 per vote)</li>
                <li>• Your SportsHub wallet is separate from other Allied iMpact apps</li>
                <li>• All transactions are secure and auditable</li>
              </ul>
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="transactions">
            {currentUser && (
              <EnhancedWalletTransactions userId={currentUser.uid} />
            )}
          </TabsContent>
        </Tabsrd>
        </div>

        {/* Info Banner */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 How Wallet Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Top up any amount from R10 (no maximum limit)</li>
              <li>• Use your balance across all SportsHub projects</li>
              <li>• Funds are deducted when you participate (e.g., R2 per vote)</li>
              <li>• Your SportsHub wallet is separate from other Allied iMpact apps</li>
              <li>• All transactions are secure and auditable</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  User,
  DollarSign,
  Info,
  Zap
} from 'lucide-react';

interface TradeDetails {
  id: string;
  status: string;
  type: 'buy' | 'sell';
  asset: string;
  cryptoAmount: number;
  pricePerUnit: number;
  totalZAR: number;
  fee: number;
  paymentMethod: string;
  terms: string;
  creatorId: string;
  creatorName: string;
  creatorTier: string;
  buyerId?: string;
  buyerName?: string;
  buyerTier?: string;
  createdAt: Date;
  expiresAt?: Date;
  escrowWallet?: string;
}

export default function TradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as string;

  const [trade, setTrade] = useState<TradeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // TODO: Get from auth context
  const currentUserId = 'user-123';

  useEffect(() => {
    fetchTradeDetails();
  }, [tradeId]);

  async function fetchTradeDetails() {
    setLoading(true);
    try {
      // TODO: Implement API endpoint to fetch trade details
      // For now, mock the data
      setTimeout(() => {
        setTrade({
          id: tradeId,
          status: 'active',
          type: 'sell',
          asset: 'BTC',
          cryptoAmount: 0.05,
          pricePerUnit: 1200000,
          totalZAR: 60000,
          fee: 60,
          paymentMethod: 'Bank Transfer',
          terms: 'Fast release. Payment within 30 minutes.',
          creatorId: 'seller-123',
          creatorName: 'Jane Crypto',
          creatorTier: 'VIP',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching trade:', error);
      setLoading(false);
    }
  }

  async function handleAcceptTrade() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/p2p-crypto/match-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: tradeId,
          buyerId: currentUserId,
          buyerName: 'John Doe', // TODO: Get from auth
          buyerTier: 'Ambassador', // TODO: Get from auth
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Trade accepted! Escrow created.');
        fetchTradeDetails();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error accepting trade:', error);
      alert('Failed to accept trade');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmPayment() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/p2p-crypto/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: tradeId,
          buyerId: currentUserId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Payment confirmed! Waiting for seller to release crypto.');
        fetchTradeDetails();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReleaseCrypto() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/p2p-crypto/release-crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: tradeId,
          sellerId: currentUserId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Crypto released! Trade completed.');
        fetchTradeDetails();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error releasing crypto:', error);
      alert('Failed to release crypto');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Trade Not Found
          </h2>
          <button
            onClick={() => router.push('/p2p-crypto/marketplace')}
            className="text-blue-600 hover:underline"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isSeller = currentUserId === trade.creatorId;
  const isBuyer = currentUserId === trade.buyerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Trade Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Trade ID: {trade.id.substring(0, 12)}...
              </p>
            </div>

            {/* Status Badge */}
            <StatusBadge status={trade.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trade Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Trade Overview
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Asset</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {trade.asset}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {trade.cryptoAmount}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price per Unit</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    R{trade.pricePerUnit.toLocaleString()}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Total Value</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-300">
                    R{trade.totalZAR.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Trading Fee (0.1%):</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    R{trade.fee.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Payment Details
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {trade.paymentMethod}
                  </span>
                </div>

                {trade.terms && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Terms & Conditions:</p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {trade.terms}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Timeline */}
            <TradeTimeline trade={trade} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer (if escrowed) */}
            {trade.status === 'escrowed' && trade.expiresAt && (
              <CountdownTimer expiresAt={trade.expiresAt} />
            )}

            {/* Participants */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Participants</h3>
              
              {/* Seller */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Seller</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {trade.creatorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trade.creatorName}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {trade.creatorTier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buyer */}
              {trade.buyerId && trade.buyerName && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Buyer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {trade.buyerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {trade.buyerName}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {trade.buyerTier}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
              
              {trade.status === 'active' && !isSeller && (
                <button
                  onClick={handleAcceptTrade}
                  disabled={actionLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors mb-3"
                >
                  {actionLoading ? 'Processing...' : 'Accept Trade'}
                </button>
              )}

              {trade.status === 'escrowed' && isBuyer && (
                <button
                  onClick={handleConfirmPayment}
                  disabled={actionLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors mb-3"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Payment Sent'}
                </button>
              )}

              {trade.status === 'payment-confirmed' && isSeller && (
                <button
                  onClick={handleReleaseCrypto}
                  disabled={actionLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors mb-3"
                >
                  {actionLoading ? 'Processing...' : 'Release Crypto'}
                </button>
              )}

              <button
                onClick={() => alert('Chat feature coming soon!')}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Contact Trader
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                    Escrow Protected
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Your funds are safely held in escrow until both parties confirm the trade completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    active: { label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Clock },
    matched: { label: 'Matched', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: CheckCircle },
    escrowed: { label: 'Escrowed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: Shield },
    'payment-pending': { label: 'Payment Pending', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: Clock },
    'payment-confirmed': { label: 'Payment Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${config.color} flex items-center gap-2`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h3 className="font-bold text-orange-900 dark:text-orange-300">Trade Timer</h3>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
          {timeLeft}
        </p>
        <p className="text-sm text-orange-700 dark:text-orange-400">
          Time remaining to complete trade
        </p>
      </div>
    </div>
  );
}

function TradeTimeline({ trade }: { trade: TradeDetails }) {
  const steps = [
    { status: 'active', label: 'Listing Created', completed: true },
    { status: 'matched', label: 'Trade Matched', completed: ['matched', 'escrowed', 'payment-pending', 'payment-confirmed', 'completed'].includes(trade.status) },
    { status: 'escrowed', label: 'Funds Escrowed', completed: ['escrowed', 'payment-pending', 'payment-confirmed', 'completed'].includes(trade.status) },
    { status: 'payment-confirmed', label: 'Payment Confirmed', completed: ['payment-confirmed', 'completed'].includes(trade.status) },
    { status: 'completed', label: 'Crypto Released', completed: trade.status === 'completed' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        Trade Progress
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.status} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.completed
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${
                step.completed
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

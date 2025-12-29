'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Info, 
  AlertCircle,
  DollarSign,
  Coins,
  CreditCard,
  FileText,
  Check
} from 'lucide-react';
import { P2PCryptoAsset } from '@/lib/p2p-limits';
import { calculateP2PFee, getP2PLimits, validateP2PTrade } from '@/lib/p2p-limits';
import { MembershipTierType } from '@/lib/membership-tiers';

export default function CreateP2PCryptoListing() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    type: 'sell' as 'buy' | 'sell',
    asset: 'BTC' as P2PCryptoAsset,
    cryptoAmount: '',
    pricePerUnit: '',
    paymentMethod: 'Bank Transfer',
    terms: '',
  });

  // TODO: Get from auth context
  const currentUser = {
    id: 'user-123',
    name: 'John Doe',
    tier: 'VIP' as MembershipTierType,
    weeklyVolume: 50000, // Mock data
    activeListings: 2, // Mock data
  };

  const totalZAR = parseFloat(formData.cryptoAmount || '0') * parseFloat(formData.pricePerUnit || '0');
  const fee = calculateP2PFee(totalZAR);
  const limits = getP2PLimits(currentUser.tier);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Validate
      const validation = validateP2PTrade({
        tier: currentUser.tier,
        tradeAmount: totalZAR,
        currentWeeklyVolume: currentUser.weeklyVolume,
        activeListingsCount: currentUser.activeListings,
      });

      if (!validation.allowed) {
        alert(validation.reason);
        setLoading(false);
        return;
      }

      // Create listing
      const res = await fetch('/api/p2p-crypto/create-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userTier: currentUser.tier,
          type: formData.type,
          asset: formData.asset,
          cryptoAmount: parseFloat(formData.cryptoAmount),
          pricePerUnit: parseFloat(formData.pricePerUnit),
          paymentMethod: formData.paymentMethod,
          terms: formData.terms,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Listing created successfully!');
        router.push('/p2p-crypto/marketplace');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create P2P Crypto Listing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your trade offer for the community
          </p>
        </div>

        {/* Your Limits Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Your {currentUser.tier} Tier Limits
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 dark:text-blue-400">Max Trade</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {limits.maxTradeAmount === Infinity ? 'Unlimited' : `R${limits.maxTradeAmount.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-400">Weekly Volume</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    R{currentUser.weeklyVolume.toLocaleString()} / {limits.maxWeeklyVolume === Infinity ? '∞' : `R${limits.maxWeeklyVolume.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-400">Active Listings</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    {currentUser.activeListings} / {limits.maxActiveListings === Infinity ? '∞' : limits.maxActiveListings}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 dark:text-blue-400">Fee Rate</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">0.1%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          {/* Trade Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Trade Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'sell' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'sell'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="font-semibold text-gray-900 dark:text-white">Sell Crypto</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    I have crypto to sell
                  </p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'buy' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'buy'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🛒</div>
                  <p className="font-semibold text-gray-900 dark:text-white">Buy Crypto</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    I want to buy crypto
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Asset Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Coins className="w-4 h-4 inline mr-2" />
              Cryptocurrency
            </label>
            <select
              value={formData.asset}
              onChange={(e) => setFormData({ ...formData, asset: e.target.value as P2PCryptoAsset })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="USDC">USD Coin (USDC)</option>
            </select>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Crypto Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={formData.cryptoAmount}
                onChange={(e) => setFormData({ ...formData, cryptoAmount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                {formData.asset}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Price per Unit (ZAR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                R
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash Deposit">Cash Deposit</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="PayPal">PayPal</option>
              <option value="Wise">Wise</option>
            </select>
          </div>

          {/* Terms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Trade Terms (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="E.g., Fast release. Payment within 30 minutes. Include order ID in transfer notes."
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Summary */}
          {totalZAR > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Trade Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Crypto Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formData.cryptoAmount} {formData.asset}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price per Unit:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    R{parseFloat(formData.pricePerUnit || '0').toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      R{totalZAR.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Trading Fee (0.1%):</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      -R{fee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.cryptoAmount || !formData.pricePerUnit}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Listing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Create Listing
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            By creating this listing, you agree to our Terms of Service and Trading Guidelines
          </p>
        </div>
      </div>
    </div>
  );
}

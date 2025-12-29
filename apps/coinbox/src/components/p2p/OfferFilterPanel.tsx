'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AssetType, PaymentMethod, paymentMethodIcons, assetIcons } from '@/lib/p2p-mock-data';
import { fadeIn } from '@/lib/animations';

export interface FilterState {
  searchQuery: string;
  selectedAsset: AssetType | 'all';
  selectedPaymentMethods: PaymentMethod[];
  minAmount: string;
  maxAmount: string;
  priceType: 'all' | 'fixed' | 'floating';
  verificationLevel: 'all' | 'basic' | 'verified' | 'premium';
}

interface OfferFilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const assets: (AssetType | 'all')[] = ['all', 'BTC', 'ETH', 'USDT', 'USDC'];
const paymentMethods: PaymentMethod[] = ['Bank Transfer', 'PayPal', 'Cash App', 'Venmo', 'Zelle', 'Wise', 'Mobile Money'];

export function OfferFilterPanel({ filters, onFilterChange }: OfferFilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const methods = filters.selectedPaymentMethods.includes(method)
      ? filters.selectedPaymentMethods.filter((m) => m !== method)
      : [...filters.selectedPaymentMethods, method];
    updateFilter('selectedPaymentMethods', methods);
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      selectedAsset: 'all',
      selectedPaymentMethods: [],
      minAmount: '',
      maxAmount: '',
      priceType: 'all',
      verificationLevel: 'all',
    });
  };

  const activeFilterCount = [
    filters.selectedAsset !== 'all',
    filters.selectedPaymentMethods.length > 0,
    filters.minAmount || filters.maxAmount,
    filters.priceType !== 'all',
    filters.verificationLevel !== 'all',
  ].filter(Boolean).length;

  return (
    <motion.div variants={fadeIn} className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by seller name or terms..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#0A0F1E] border border-[#1E293B] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#193281] transition-colors"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A0F1E] border border-[#1E293B] rounded-lg text-white hover:border-[#193281] transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-[#193281] rounded-full text-xs">{activeFilterCount}</span>
          )}
        </motion.button>

        {activeFilterCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </motion.button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#0A0F1E] border border-[#1E293B] rounded-lg p-6 space-y-6"
        >
          {/* Asset Filter */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Asset</label>
            <div className="flex flex-wrap gap-2">
              {assets.map((asset) => (
                <motion.button
                  key={asset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateFilter('selectedAsset', asset)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    filters.selectedAsset === asset
                      ? 'bg-gradient-to-r from-[#193281] to-[#2563EB] text-white'
                      : 'bg-[#1E293B] text-gray-300 hover:bg-[#2A3B5B]'
                  }`}
                >
                  {asset === 'all' ? 'All Assets' : `${assetIcons[asset as AssetType]} ${asset}`}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Payment Methods</label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePaymentMethod(method)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    filters.selectedPaymentMethods.includes(method)
                      ? 'bg-gradient-to-r from-[#193281] to-[#2563EB] text-white'
                      : 'bg-[#1E293B] text-gray-300 hover:bg-[#2A3B5B]'
                  }`}
                >
                  <span>{paymentMethodIcons[method]}</span>
                  <span>{method}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Amount Range (USD)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) => updateFilter('minAmount', e.target.value)}
                className="px-4 py-2 bg-[#1E293B] border border-[#2A3B5B] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#193281] transition-colors"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) => updateFilter('maxAmount', e.target.value)}
                className="px-4 py-2 bg-[#1E293B] border border-[#2A3B5B] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#193281] transition-colors"
              />
            </div>
          </div>

          {/* Price Type */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Price Type</label>
            <div className="flex gap-2">
              {(['all', 'fixed', 'floating'] as const).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateFilter('priceType', type)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                    filters.priceType === type
                      ? 'bg-gradient-to-r from-[#193281] to-[#2563EB] text-white'
                      : 'bg-[#1E293B] text-gray-300 hover:bg-[#2A3B5B]'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Verification Level */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Seller Verification</label>
            <div className="flex gap-2">
              {(['all', 'basic', 'verified', 'premium'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateFilter('verificationLevel', level)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                    filters.verificationLevel === level
                      ? 'bg-gradient-to-r from-[#193281] to-[#2563EB] text-white'
                      : 'bg-[#1E293B] text-gray-300 hover:bg-[#2A3B5B]'
                  }`}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

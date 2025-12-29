'use client';

/**
 * Advanced P2P Crypto Search & Filters Component
 * 
 * Features:
 * - Asset filter (BTC, ETH, USDT, USDC)
 * - Type filter (Buy/Sell)
 * - Price range filter
 * - Payment method filter
 * - Min rating filter
 * - Amount range filter
 */

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { P2PCryptoAsset } from '@/lib/p2p-limits';

export interface SearchFilters {
  asset?: P2PCryptoAsset | 'all';
  type?: 'buy' | 'sell' | 'all';
  minPrice?: number;
  maxPrice?: number;
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: string[];
  minRating?: number;
  searchQuery?: string;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export default function AdvancedSearch({ onFiltersChange, initialFilters }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    asset: 'all',
    type: 'all',
  });

  const assets: (P2PCryptoAsset | 'all')[] = ['all', 'BTC', 'ETH', 'USDT', 'USDC'];
  const paymentMethods = ['Bank Transfer', 'EFT', 'Cash Deposit', 'Instant EFT'];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      asset: 'all',
      type: 'all',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.minAmount || 
    filters.maxAmount || (filters.paymentMethods && filters.paymentMethods.length > 0) || 
    filters.minRating || filters.searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by username, amount, or payment method..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {Object.values(filters).filter(v => v && v !== 'all').length}
            </span>
          )}
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Asset Tabs */}
        {assets.map(asset => (
          <button
            key={asset}
            onClick={() => handleFilterChange('asset', asset)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.asset === asset
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {asset === 'all' ? 'All Assets' : asset}
          </button>
        ))}

        <div className="w-px bg-gray-300 mx-2" />

        {/* Type Tabs */}
        {['all', 'buy', 'sell'].map(type => (
          <button
            key={type}
            onClick={() => handleFilterChange('type', type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filters.type === type
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type === 'buy' ? 'Buying' : 'Selling'}
          </button>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (per unit)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min (ZAR)"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">—</span>
                <input
                  type="number"
                  placeholder="Max (ZAR)"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crypto Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  step="0.01"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  step="0.01"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Methods
              </label>
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.paymentMethods?.includes(method) || false}
                      onChange={(e) => {
                        const current = filters.paymentMethods || [];
                        const updated = e.target.checked
                          ? [...current, method]
                          : current.filter(m => m !== method);
                        handleFilterChange('paymentMethods', updated.length > 0 ? updated : undefined);
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[3, 3.5, 4, 4.5, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', filters.minRating === rating ? undefined : rating)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.minRating === rating
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⭐ {rating}+
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {filters.minPrice && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Min Price: R{filters.minPrice}
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Max Price: R{filters.maxPrice}
                  </span>
                )}
                {filters.minAmount && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Min Amount: {filters.minAmount}
                  </span>
                )}
                {filters.maxAmount && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Max Amount: {filters.maxAmount}
                  </span>
                )}
                {filters.paymentMethods && filters.paymentMethods.length > 0 && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Payment: {filters.paymentMethods.join(', ')}
                  </span>
                )}
                {filters.minRating && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    Rating: {filters.minRating}+ ⭐
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

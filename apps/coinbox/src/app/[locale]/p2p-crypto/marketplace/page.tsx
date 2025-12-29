'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Shield,
  Plus,
  Zap
} from 'lucide-react';
import { P2PCryptoListing } from '@/lib/p2p-crypto/service';
import { P2PCryptoAsset } from '@/lib/p2p-limits';

export default function P2PCryptoMarketplace() {
  const router = useRouter();
  const [listings, setListings] = useState<P2PCryptoListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<'all' | P2PCryptoAsset>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'buy' | 'sell'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, [selectedAsset, selectedType]);

  async function fetchListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAsset !== 'all') params.append('asset', selectedAsset);
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('limit', '50');

      const res = await fetch(`/api/p2p-crypto/listings?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = listings.filter(listing => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        listing.creatorName.toLowerCase().includes(query) ||
        listing.asset.toLowerCase().includes(query) ||
        listing.paymentMethod.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-8 h-8 text-blue-600" />
                P2P Crypto Marketplace
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Trade crypto directly with verified users
              </p>
            </div>
            
            <button
              onClick={() => router.push('/p2p-crypto/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user, asset, or payment method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Asset Filter */}
            <div>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Assets</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="USDC">USD Coin (USDC)</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy Orders</option>
                <option value="sell">Sell Orders</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or create a new listing
            </p>
            <button
              onClick={() => router.push('/p2p-crypto/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: P2PCryptoListing }) {
  const router = useRouter();

  const getAssetIcon = (asset: string) => {
    const icons: Record<string, string> = {
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
      USDC: '$',
    };
    return icons[asset] || '₿';
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Basic: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      Ambassador: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      VIP: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Business: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[tier] || colors.Basic;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {getAssetIcon(listing.asset)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {listing.asset}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {listing.cryptoAmount} {listing.asset}
              </p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            listing.type === 'buy'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {listing.type === 'buy' ? (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                BUY
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                SELL
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price per unit</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            R{listing.pricePerUnit.toLocaleString()}
          </p>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            R{listing.totalZAR.toLocaleString()}
          </span>
        </div>

        {/* Fee */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">Trading Fee (0.1%):</span>
          <span className="text-gray-600 dark:text-gray-300">
            R{listing.fee.toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          {/* Seller Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {listing.creatorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {listing.creatorName}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(listing.creatorTier)}`}>
                  {listing.creatorTier}
                </span>
              </div>
            </div>
            
            <Shield className="w-5 h-5 text-green-500" />
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span>{listing.paymentMethod}</span>
          </div>

          {/* Terms */}
          {listing.terms && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
              {listing.terms}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push(`/p2p-crypto/trade/${listing.id}`)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Accept Trade
        </button>
      </div>
    </motion.div>
  );
}

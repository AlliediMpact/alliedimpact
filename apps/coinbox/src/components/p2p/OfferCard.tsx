'use client';

import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, Shield } from 'lucide-react';
import { P2POffer, paymentMethodIcons, assetIcons } from '@/lib/p2p-mock-data';
import { fadeIn } from '@/lib/animations';

interface OfferCardProps {
  offer: P2POffer;
  onAction: (offerId: string) => void;
  actionLabel?: string;
}

export function OfferCard({ offer, onAction, actionLabel }: OfferCardProps) {
  const { seller, asset, price, priceType, minLimit, maxLimit, availableAmount, paymentMethods, type } = offer;

  const priceDisplay = priceType === 'floating' 
    ? `Market ${offer.floatPercentage! > 0 ? '+' : ''}${offer.floatPercentage}%`
    : `$${price.toLocaleString()}`;

  const verificationBadge = {
    basic: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Basic' },
    verified: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Verified' },
    premium: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Premium' },
  };

  const badge = verificationBadge[seller.verificationLevel];

  return (
    <motion.div
      variants={fadeIn}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6 hover:border-[#193281] transition-all duration-300 cursor-pointer"
      onClick={() => onAction(offer.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#193281] to-[#2563EB] flex items-center justify-center text-2xl">
            {seller.avatar ? (
              <img src={seller.avatar} alt={seller.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              seller.name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{seller.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${badge.bg} ${badge.color} flex items-center gap-1`}>
                <Shield className="w-3 h-3" />
                {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {seller.rating}
              </span>
              <span>{seller.totalTrades} trades</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {seller.completionRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4" />
            {seller.responseTime}
          </div>
        </div>
      </div>

      {/* Offer Details */}
      <div className="border-t border-[#1E293B] pt-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Asset</div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span>{assetIcons[asset]}</span>
              <span>{asset}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Price</div>
            <div className="text-xl font-bold text-white">{priceDisplay}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Available</div>
            <div className="text-lg font-semibold text-white">
              {availableAmount} {asset}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Limits</div>
            <div className="text-sm font-semibold text-white">
              ${minLimit.toLocaleString()} - ${maxLimit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Payment Methods</div>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-3 py-1 bg-[#1E293B] rounded-full text-sm text-gray-300 flex items-center gap-1"
              >
                <span>{paymentMethodIcons[method]}</span>
                <span>{method}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-1">Terms</div>
          <div className="text-sm text-gray-300 line-clamp-2">{offer.terms}</div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
            type === 'sell'
              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
          }`}
        >
          {actionLabel || (type === 'sell' ? 'Buy' : 'Sell')} {asset}
        </motion.button>
      </div>
    </motion.div>
  );
}

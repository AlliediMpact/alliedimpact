'use client';

import { motion } from 'framer-motion';
import { Star, Shield, TrendingUp } from 'lucide-react';
import { P2POffer } from '@/lib/p2p-mock-data';

interface UserMiniProfileProps {
  user: P2POffer['seller'];
  showStats?: boolean;
}

export function UserMiniProfile({ user, showStats = true }: UserMiniProfileProps) {
  const verificationBadge = {
    basic: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Basic' },
    verified: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Verified' },
    premium: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Premium' },
  };

  const badge = verificationBadge[user.verificationLevel];

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#193281] to-[#2563EB] flex items-center justify-center text-lg flex-shrink-0">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          user.name[0]
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-white truncate">{user.name}</h4>
          <span className={`px-2 py-0.5 rounded text-xs ${badge.bg} ${badge.color} flex items-center gap-1 flex-shrink-0`}>
            <Shield className="w-3 h-3" />
            {badge.label}
          </span>
        </div>
        {showStats && (
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {user.rating}
            </span>
            <span>{user.totalTrades} trades</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              {user.completionRate}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

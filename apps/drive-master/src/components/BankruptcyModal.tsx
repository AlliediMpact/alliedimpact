'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { GamificationService } from '@/lib/services/GamificationService';

export default function BankruptcyModal({
  userId,
  onRecovered,
}: {
  userId: string;
  onRecovered: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  const handleRecovery = async () => {
    setLoading(true);
    try {
      const gamificationService = new GamificationService(userId);
      const recovered = await gamificationService.offerBankruptcyRecovery();

      if (recovered) {
        onRecovered();
      } else {
        setAlreadyUsed(true);
      }
    } catch (error) {
      console.error('Recovery failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💸</div>
          <h2 className="text-3xl font-bold mb-2">Out of Credits!</h2>
          <p className="text-gray-600">
            You've run out of credits and can't start new journeys.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Recovery Options</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Get 50 free credits (once per day)</li>
            <li>• Maintain your streak with a free journey</li>
            <li>• Earn more credits by completing journeys</li>
          </ul>
        </div>

        {alreadyUsed ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-yellow-800 text-sm">
              ⏰ You've already used today's free recovery. Come back tomorrow!
            </p>
          </div>
        ) : (
          <Button
            onClick={handleRecovery}
            disabled={loading}
            className="w-full mb-4"
            size="lg"
          >
            {loading ? 'Processing...' : 'Get 50 Free Credits'}
          </Button>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Want unlimited access?
          </p>
          <Button variant="outline" className="w-full" size="lg">
            Upgrade to Lifetime (R99)
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          💡 Tips: Answer correctly (+10 credits) and avoid quitting journeys (-15 credits)
        </div>
      </div>
    </div>
  );
}

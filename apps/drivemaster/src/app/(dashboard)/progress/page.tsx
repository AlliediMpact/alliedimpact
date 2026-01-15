'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { MasteryService, StageProgress, Badge } from '@/lib/services/MasteryService';
import { Stage, MASTERY_THRESHOLDS } from '@/lib/types/game';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function ProgressPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stagesProgress, setStagesProgress] = useState<StageProgress[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const masteryService = new MasteryService(user.uid);
      const [stages, allBadges] = await Promise.all([
        masteryService.getAllStagesProgress(),
        masteryService.getAllBadgesWithProgress(),
      ]);

      setStagesProgress(stages);
      setBadges(allBadges);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earnedAt);
  const unearnedBadges = badges.filter((b) => !b.earnedAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Progress</h1>
              <p className="text-sm text-gray-600">Track your mastery journey</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stage Progress */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">Stage Mastery</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {stagesProgress.map((progress) => (
              <StageProgressCard key={progress.stage} progress={progress} />
            ))}
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">Badges</h2>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Earned ({earnedBadges.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedBadges.map((badge) => (
                  <BadgeCard key={badge.badgeId} badge={badge} earned={true} />
                ))}
              </div>
            </div>
          )}

          {/* Unearned Badges */}
          {unearnedBadges.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Available ({unearnedBadges.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unearnedBadges.map((badge) => (
                  <BadgeCard key={badge.badgeId} badge={badge} earned={false} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StageProgressCard({ progress }: { progress: StageProgress }) {
  const threshold = MASTERY_THRESHOLDS[progress.stage];
  const scoreProgress = Math.min((progress.averageScore / threshold.min) * 100, 100);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
      progress.isMastered ? 'border-green-500' : progress.isUnlocked ? 'border-gray-200' : 'border-gray-300 opacity-50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold capitalize">{progress.stage}</h3>
          <p className="text-sm text-gray-600">
            Requires {threshold.min}% average
          </p>
        </div>
        <div>
          {progress.isMastered && <span className="text-3xl">✅</span>}
          {!progress.isUnlocked && <span className="text-3xl">🔒</span>}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-primary-600">
            {progress.journeysCompleted}
          </div>
          <div className="text-xs text-gray-600">Journeys Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary-600">
            {progress.totalAttempts}
          </div>
          <div className="text-xs text-gray-600">Total Attempts</div>
        </div>
      </div>

      {/* Score Progress */}
      {progress.isUnlocked && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Average Score</span>
            <span className="font-bold">
              {progress.averageScore.toFixed(1)}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                progress.isMastered ? 'bg-green-500' : 'bg-primary-600'
              }`}
              style={{ width: `${scoreProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Best: {progress.bestScore.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Next Requirements */}
      {progress.nextRequirements && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <div className="font-semibold text-blue-800 mb-1">Next Goal:</div>
          <div className="text-blue-600">{progress.nextRequirements}</div>
        </div>
      )}

      {/* Mastery Date */}
      {progress.isMastered && progress.masteryDate && (
        <div className="text-xs text-gray-500 mt-4">
          Mastered on {progress.masteryDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <div
      className={`bg-white rounded-lg p-4 text-center border-2 transition-all ${
        earned
          ? 'border-yellow-400 shadow-lg'
          : 'border-gray-200 opacity-60'
      }`}
    >
      <div className={`text-4xl mb-2 ${earned ? '' : 'grayscale'}`}>
        {badge.icon}
      </div>
      <div className="font-semibold text-sm mb-1">{badge.name}</div>
      <div className="text-xs text-gray-600 mb-2">{badge.description}</div>

      {earned && badge.earnedAt && (
        <div className="text-xs text-gray-500">
          {badge.earnedAt.toLocaleDateString()}
        </div>
      )}

      {!earned && badge.progress !== undefined && badge.required !== undefined && (
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full"
              style={{
                width: `${(badge.progress / badge.required) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {badge.progress} / {badge.required}
          </div>
        </div>
      )}
    </div>
  );
}

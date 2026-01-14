'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { GamificationService } from '@/lib/services/GamificationService';
import { MasteryService, Badge, StageProgress } from '@/lib/services/MasteryService';
import { CertificateService, Certificate } from '@/lib/services/CertificateService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [streakInfo, setStreakInfo] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stagesProgress, setStagesProgress] = useState<StageProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const gamificationService = new GamificationService(user.uid);
      const masteryService = new MasteryService(user.uid);
      const certificateService = new CertificateService();

      const [gamificationStats, streak, earnedBadges, stages, userCertificates] = await Promise.all([
        gamificationService.getGamificationStats(),
        gamificationService.getStreakInfo(),
        masteryService.getEarnedBadges(),
        masteryService.getAllStagesProgress(),
        certificateService.getUserCertificates(user.uid),
      ]);

      setStats(gamificationStats);
      setStreakInfo(streak);
      setBadges(earnedBadges);
      setStagesProgress(stages);
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading profile:', error);
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

  if (!user || !userProfile || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold">
              {userProfile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{userProfile.displayName}</h2>
              <p className="text-gray-600 mb-4">{userProfile.email}</p>
              <div className="flex gap-4">
                <div className="bg-primary-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-primary-600 font-semibold">Subscription</div>
                  <div className="text-lg font-bold capitalize">{userProfile?.tier || 'free'}</div>
                </div>
                <div className="bg-green-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-green-600 font-semibold">Current Stage</div>
                  <div className="text-lg font-bold capitalize">{userProfile?.currentStage || 'beginner'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Credits Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Credits</h3>
              <span className="text-4xl">💰</span>
            </div>
            <div className="text-5xl font-bold mb-2">{stats.credits}</div>
            <div className="text-sm opacity-90">
              Earned: {stats.totalCreditsEarned} | Spent: {stats.totalCreditsSpent}
            </div>
            {stats.isBankrupt && (
              <div className="mt-4 bg-red-600 bg-opacity-50 rounded px-3 py-2 text-sm">
                ⚠️ Bankrupt - Complete daily free journey to recover
              </div>
            )}
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Streak</h3>
              <span className="text-4xl">🔥</span>
            </div>
            <div className="text-5xl font-bold mb-2">{streakInfo?.currentStreak || 0}</div>
            <div className="text-sm opacity-90">
              Days in a row
            </div>
            <div className="text-xs mt-2 opacity-75">
              Longest: {streakInfo?.longestStreak || 0} days
            </div>
            {streakInfo?.streakBonusEarned && (
              <div className="mt-4 bg-white bg-opacity-20 rounded px-3 py-2 text-sm">
                ✨ +{20} credits earned today!
              </div>
            )}
            {streakInfo && (
              <div className="mt-2 text-xs opacity-75">
                Next milestone: {streakInfo.nextStreakReward} days
              </div>
            )}
          </div>

          {/* Badges Card */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Badges</h3>
              <span className="text-4xl">🏅</span>
            </div>
            <div className="text-5xl font-bold mb-2">{badges.length}</div>
            <div className="text-sm opacity-90">
              Badges earned
            </div>
            <div className="flex gap-2 mt-4">
              {badges.slice(0, 3).map((badge) => (
                <span key={badge.badgeId} className="text-2xl">
                  {badge.icon}
                </span>
              ))}
              {badges.length > 3 && (
                <span className="text-sm self-center">+{badges.length - 3} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Performance Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              label="Journeys Completed"
              value={stats.totalJourneys}
              icon="🚗"
            />
            <StatCard
              label="Average Score"
              value={`${stats.averageScore.toFixed(1)}%`}
              icon="📊"
            />
            <StatCard
              label="Total Questions"
              value={userProfile.totalQuestionsAnswered}
              icon="❓"
            />
            <StatCard
              label="Correct Answers"
              value={userProfile.totalCorrectAnswers}
              icon="✅"
            />
          </div>
        </div>

        {/* Stage Progress */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Stage Progress</h2>
            <Link href="/progress">
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {stagesProgress.map((stage) => (
              <StageProgressMini key={stage.stage} progress={stage} />
            ))}
          </div>
        </div>

        {/* Badges Gallery */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Badges Collection</h2>
            <Link href="/progress">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.badgeId}
                className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 text-center border-2 border-yellow-400"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-xs font-semibold">{badge.name}</div>
              </div>
            ))}
          </div>
          {badges.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No badges earned yet. Complete journeys to earn your first badge! 🎯
            </div>
          )}
        </div>
        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h2 className="text-xl font-bold mb-6">🏆 My Certificates</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div key={cert.certificateNumber} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg capitalize text-blue-700">{cert.stage} Stage</h3>
                      <p className="text-sm text-gray-600">Certificate #{cert.certificateNumber}</p>
                    </div>
                    <div className="text-3xl">🎓</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Score:</span>
                      <span className="font-semibold text-blue-900">{cert.score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Completed:</span>
                      <span className="font-semibold text-blue-900">
                        {new Date(cert.completionDate).toLocaleDateString('en-ZA', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => window.open(cert.pdfUrl, '_blank')}
                      className="flex-1"
                    >
                      📄 Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(cert.verificationUrl, '_blank')}
                      className="flex-1"
                    >
                      🔍 Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-primary-600 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function StageProgressMini({ progress }: { progress: StageProgress }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-2xl">
        {progress.isMastered ? '✅' : progress.isUnlocked ? '🎯' : '🔒'}
      </div>
      <div className="flex-1">
        <div className="font-semibold capitalize">{progress.stage}</div>
        <div className="text-sm text-gray-600">
          {progress.journeysCompleted} journeys • {progress.averageScore.toFixed(1)}% avg
        </div>
      </div>
      {progress.isMastered && (
        <div className="text-green-600 font-semibold text-sm">Mastered</div>
      )}
    </div>
  );
}

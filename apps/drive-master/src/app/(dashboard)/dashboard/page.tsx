'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@allied-impact/ui';
import { logoutUser } from '@/lib/firebase/auth';
import { GamificationService } from '@/lib/services/GamificationService';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { SchoolAdCarousel } from '@/components/SchoolAdCarousel';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  
  const [streakInfo, setStreakInfo] = useState<any>(null);
  const [streakBonus, setStreakBonus] = useState(false);
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      checkStreak();
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;
    
    const subscriptionService = new SubscriptionService(user.uid);
    const subInfo = await subscriptionService.getSubscriptionInfo();
    // Show ads for Free and Trial users only
    setShowAds(subInfo.tier === 'free' || subInfo.tier === 'trial');
  };

  const checkStreak = async () => {
    if (!user) return;
    
    const gamificationService = new GamificationService(user.uid);
    const streak = await gamificationService.checkDailyStreak();
    setStreakInfo(streak);
    
    if (streak.streakBonusEarned) {
      setStreakBonus(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setStreakBonus(false), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Streak Bonus Toast */}
      {streakBonus && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-bold">Daily Streak Bonus!</div>
              <div className="text-sm">+20 credits earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">DriveMaster</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hi, {userProfile.displayName}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Welcome, {userProfile.displayName}! 👋
          </h2>
          <p className="text-gray-600 mb-6">
            Ready to continue your journey to mastery?
          </p>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              label="Current Stage"
              value={userProfile.currentStage}
              icon="🎯"
            />
            <StatCard
              label="Credits"
              value={userProfile.credits}
              icon="💰"
            />
            <StatCard
              label="Streak"
              value={streakInfo?.currentStreak || 0}
              icon="🔥"
              suffix="days"
            />
            <StatCard
              label="Journeys"
              value={userProfile.totalJourneysCompleted}
              icon="🚗"
            />
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {userProfile.tier === 'free' && '🆓 Free Account'}
                {userProfile.tier === 'trial' && '⏰ Trial Active'}
                {userProfile.tier === 'paid' && '⭐ Lifetime Member'}
              </h3>

        {/* School Ad Carousel - Show for Free and Trial users */}
        {showAds && (
          <div className="mb-8">
            <SchoolAdCarousel />
          </div>
        )}
              <p className="text-primary-100">
                {userProfile.tier === 'free' && 'Upgrade to unlock all stages'}
                {userProfile.tier === 'trial' && 'Trial expires in X days'}
                {userProfile.tier === 'paid' && 'Enjoy unlimited access forever'}
              </p>
            </div>
            {userProfile.tier !== 'paid' && (
              <Button variant="secondary">
                Upgrade Now
              </Button>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Your Progress</h3>
          
          <div className="space-y-4">
            <ProgressStage
              stage="Beginner"
              threshold="95-100%"
              completed={userProfile.stagesCompleted.includes('beginner')}
              current={userProfile.currentStage === 'beginner'}
              locked={false}
            />
            <ProgressStage
              stage="Intermediate"
              threshold="97-100%"
              completed={userProfile.stagesCompleted.includes('intermediate')}
              current={userProfile.currentStage === 'intermediate'}
              locked={!userProfile.stagesCompleted.includes('beginner')}
            />
            <ProgressStage
              stage="Advanced"
              threshold="98-100%"
              completed={userProfile.stagesCompleted.includes('advanced')}
              current={userProfile.currentStage === 'advanced'}
              locked={!userProfile.stagesCompleted.includes('intermediate')}
            />
            <ProgressStage
              stage="K53 Simulation"
              threshold="100%"
              completed={userProfile.stagesCompleted.includes('k53')}
              current={userProfile.currentStage === 'k53'}
              locked={!userProfile.stagesCompleted.includes('advanced')}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <ActionCard
            title="Start Journey"
            description="Begin a new learning journey"
            icon="🚗"
            buttonText="Start Now"
            onClick={() => router.push('/journeys')}
          />
          <ActionCard
            title="View Progress"
            description="See your detailed statistics"
            icon="📊"
            buttonText="View Stats"
            onClick={() => router.push('/progress')}
          />
          <ActionCard
            title="Certificates"
            description="Download your achievements"
            icon="🏆"
            buttonText="View Certificates"
            onClick={() => router.push('/certificates')}
          />
        </div>
      </main>
    </div>
  );
}

  label, 
  value, 
  icon, 
  suffix 
}: { 
  label: string; 
  value: string | number; 
  icon: string;
  suffix?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value}{suffix ? ` ${suffix}` : ''}
      
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ProgressStage({
  stage,
  threshold,
  completed,
  current,
  locked,
}: {
  stage: string;
  threshold: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}) {
  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${
      completed ? 'border-green-500 bg-green-50' :
      current ? 'border-blue-500 bg-blue-50' :
      locked ? 'border-gray-300 bg-gray-50' :
      'border-yellow-500 bg-yellow-50'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-lg">
            {completed && '✓ '}
            {locked && '🔒 '}
            {stage}
          </h4>
          <p className="text-sm text-gray-600">Required: {threshold}</p>
        </div>
        {current && <span className="text-sm font-semibold text-blue-600">CURRENT</span>}
        {completed && <span className="text-sm font-semibold text-green-600">COMPLETED</span>}
        {locked && <span className="text-sm font-semibold text-gray-600">LOCKED</span>}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button onClick={onClick} className="w-full">
        {buttonText}
      </Button>
    </div>
  );
}

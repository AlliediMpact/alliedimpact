'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { GameEngine } from '@/lib/services/GameEngine';
import { GamificationService } from '@/lib/services/GamificationService';
import { SubscriptionService } from '@/lib/services/SubscriptionService';
import { Journey, Stage } from '@/lib/types/game';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';
import BankruptcyModal from '@/components/BankruptcyModal';
import { useBulkDifficultyData } from '@/hooks/useDifficultyData';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { Bookmark } from 'lucide-react';

export default function JourneysPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage>('beginner');
  const [showBankruptcy, setShowBankruptcy] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [bookmarkedJourneys, setBookmarkedJourneys] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Fetch difficulty data for all journeys
  const journeyIds = journeys.map((j) => j.journeyId);
  const { difficulties } = useBulkDifficultyData(journeyIds);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    checkDailyLimit();
    if (userProfile) {
      loadJourneys(userProfile.currentStage);
      checkBankruptcy();
      loadBookmarks();
    }
  }, [userProfile]);

  const loadBookmarks = async () => {
    if (!user) return;
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      const userDoc = await getDoc(doc(db, 'users', user.uid, 'bookmarks', 'journeys'));
      if (userDoc.exists()) {
        setBookmarkedJourneys(userDoc.data().journeyIds || []);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const toggleBookmark = async (journeyId: string) => {
    if (!user) return;

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');

      const newBookmarks = bookmarkedJourneys.includes(journeyId)
        ? bookmarkedJourneys.filter((id) => id !== journeyId)
        : [...bookmarkedJourneys, journeyId];

      await setDoc(doc(db, 'users', user.uid, 'bookmarks', 'journeys'), {
        journeyIds: newBookmarks,
        updatedAt: new Date().toISOString(),
      });

      setBookmarkedJourneys(newBookmarks);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const loadJourneys = async (stage: Stage) => {
    setLoadingJourneys(true);
    try {
      const gameEngine = new GameEngine(user!.uid);
      const fetchedJourneys = await gameEngine.getJourneysByStage(stage);
      setJourneys(fetchedJourneys);
    } catch (error) {
      console.error('Error loading journeys:', error);
    } finally {
      setLoadingJourneys(false);
    }
  };

  const checkBankruptcy = async () => {
    if (!user || !userProfile) return;
    const gamificationService = new GamificationService(user.uid);
    const isBankrupt = await gamificationService.isBankrupt();
    setShowBankruptcy(isBankrupt);
  };

  const checkDailyLimit = async () => {
    if (!user || !userProfile) return;
    const subscriptionService = new SubscriptionService(user.uid);
    const canStart = await subscriptionService.canStartJourney();
    setDailyLimitReached(!canStart.allowed);
  };

  const handleBankruptcyRecovered = () => {
    setShowBankruptcy(false);
    window.location.reload();
  };

  const canAccessStage = (stage: Stage): boolean => {
    if (!userProfile) return false;

    const tier = userProfile.tier || 'free';
    
    if (tier === 'free') {
      return stage === 'beginner';
    }

    // For paid/trial tiers, users can access any stage
    return true;
  };

  const handleStageChange = (stage: Stage) => {
    setSelectedStage(stage);
    loadJourneys(stage);
  };

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {showBankruptcy && user && (
        <BankruptcyModal userId={user.uid} onRecovered={handleBankruptcyRecovered} />
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
            DriveMaster
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">Credits: </span>
              <span className="font-bold text-primary-600">{userProfile.credits}</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Choose Your Journey</h1>
            <p className="text-gray-600">
              Select a journey from your current stage to begin learning
            </p>
          </div>
          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showBookmarkedOnly
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">
              {showBookmarkedOnly ? 'Show All' : 'Bookmarks Only'}
            </span>
            {bookmarkedJourneys.length > 0 && (
              <span className="bg-white text-primary-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {bookmarkedJourneys.length}
              </span>
            )}
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Select Stage</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StageButton
              stage="beginner"
              label="Beginner"
              threshold="95-100%"
              isActive={selectedStage === 'beginner'}
              isLocked={!canAccessStage('beginner')}
              onClick={() => handleStageChange('beginner')}
            />
            <StageButton
              stage="intermediate"
              label="Intermediate"
              threshold="97-100%"
              isActive={selectedStage === 'intermediate'}
              isLocked={!canAccessStage('intermediate')}
              onClick={() => handleStageChange('intermediate')}
            />
            <StageButton
              stage="advanced"
              label="Advanced"
              threshold="98-100%"
              isActive={selectedStage === 'advanced'}
              isLocked={!canAccessStage('advanced')}
              onClick={() => handleStageChange('advanced')}
            />
            <StageButton
              stage="k53"
              label="K53 Simulation"
              threshold="100%"
              isActive={selectedStage === 'k53'}
              isLocked={!canAccessStage('k53')}
              onClick={() => handleStageChange('k53')}
            />
          </div>
        </div>

        {loadingJourneys ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys
              .filter((journey) =>
                showBookmarkedOnly ? bookmarkedJourneys.includes(journey.journeyId) : true
              )
              .map((journey) => (
                <JourneyCard
                  key={journey.journeyId}
                  journey={journey}
                  userProfile={userProfile}
                  difficulty={difficulties[journey.journeyId]}
                  isBookmarked={bookmarkedJourneys.includes(journey.journeyId)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StageButton({
  stage,
  label,
  threshold,
  isActive,
  isLocked,
  onClick,
}: {
  stage: string;
  label: string;
  threshold: string;
  isActive: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`p-4 rounded-lg border-2 transition-all ${
        isLocked
          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
          : isActive
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-300 bg-white hover:border-primary-400'
      }`}
    >
      {isLocked && <div className="text-2xl mb-2">🔒</div>}
      <div className="font-bold">{label}</div>
      <div className="text-sm text-gray-600">{threshold}</div>
    </button>
  );
}

function JourneyCard({
  journey,
  userProfile,
  difficulty,
  isBookmarked,
  onToggleBookmark,
}: {
  journey: Journey;
  userProfile: any;
  difficulty?: any;
  isBookmarked?: boolean;
  onToggleBookmark?: (journeyId: string) => void;
}) {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/journeys/${journey.journeyId}/start`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(journey.journeyId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative">
      {onToggleBookmark && (
        <button
          onClick={handleBookmarkClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-colors"
        >
          <Bookmark
            className={`w-5 h-5 transition-colors ${
              isBookmarked ? 'fill-primary-600 text-primary-600' : 'text-gray-400'
            }`}
          />
        </button>
      )}

      <div
        className="h-48 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${journey.thumbnailUrl})` }}
      >
        {difficulty && (
          <div className="absolute bottom-3 left-3">
            <DifficultyBadge difficulty={difficulty} variant="compact" showPercentage={false} />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{journey.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{journey.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-500">Distance</div>
            <div className="font-semibold">{journey.route.distance} km</div>
          </div>
          <div>
            <div className="text-gray-500">Duration</div>
            <div className="font-semibold">{journey.route.estimatedDuration} min</div>
          </div>
          <div>
            <div className="text-gray-500">Events</div>
            <div className="font-semibold">{journey.events.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Avg Score</div>
            <div className="font-semibold">{journey.avgScore.toFixed(1)}%</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          <div>{journey.route.startLocation}</div>
          <div className="text-center my-1">↓</div>
          <div>{journey.route.endLocation}</div>
        </div>

        <Button onClick={handleStart} className="w-full">
          Start Journey
        </Button>
      </div>
    </div>
  );
}

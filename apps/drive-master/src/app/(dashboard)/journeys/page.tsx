'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { GameEngine } from '@/lib/services/GameEngine';
import { GamificationService } from '@/lib/services/GamificationService';
import { Journey, Stage } from '@/lib/types/game';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';
import BankruptcyModal from '@/components/BankruptcyModal';

export default function JourneysPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState(true);
  const [selectedStage, setSelectedStage] = useState<Stage>('beginner');  const [showBankruptcy, setShowBankruptcy] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      loadJourneys(userProfile.currentStage);
      checkBankruptcy();
    }
  }, [userProfile]);

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

  const handleBankruptcyRecovered = () => {
    setShowBankruptcy(false);
    window.location.reload(); // Refresh to update credits
  };
    }
  };

  const handleStageChange = (stage: Stage) => {
    setSelectedStage(stage);
    loadJourneys(stage);
  };

  const canAccessStage = (stage: Stage): boolean => {
    if (!userProfile) return false;

    // Free users can only access Beginner
    if (userProfile.tier === 'free') {
      return stage === 'beginner';
    }

    // Trial and Paid users can access based on progression
    const stageOrder: Stage[] = ['beginner', 'intermediate', 'advanced', 'k53'];
    const currentIndex = stageOrder.indexOf(userProfile.currentStage);
    const requestedIndex = stageOrder.indexOf(stage);

    return requestedIndex <= currentIndex;
  };

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bankruptcy Modal */}
      {showBankruptcy && user && (
        <BankruptcyModal userId={user.uid} onRecovered={handleBankruptcyRecovered} />
      )}

      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose Your Journey</h1>
          <p className="text-gray-600">
            Select a journey from your current stage to begin learning
          </p>
        </div>

        {/* Stage Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Stage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Journeys Grid */}
        {loadingJourneys ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading journeys...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-bold mb-2">No Journeys Available</h3>
            <p className="text-gray-600">
              Journeys for this stage are coming soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey) => (
              <JourneyCard
                key={journey.journeyId}
                journey={journey}
                userProfile={userProfile}
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
}: {
  journey: Journey;
  userProfile: any;
}) {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/journeys/${journey.journeyId}/start`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Thumbnail */}
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${journey.thumbnailUrl})` }}
      />

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{journey.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{journey.description}</p>

        {/* Stats */}
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

        {/* Route */}
        <div className="text-xs text-gray-500 mb-4">
          <div>{journey.route.startLocation}</div>
          <div className="text-center my-1">↓</div>
          <div>{journey.route.endLocation}</div>
        </div>

        {/* Action Button */}
        <Button onClick={handleStart} className="w-full">
          Start Journey
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { GameEngine } from '@/lib/services/GameEngine';
import { Journey, CAR_TYPES, CarType } from '@/lib/types/game';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function JourneyStartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const journeyId = params.journeyId as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadJourney();
  }, [user, journeyId]);

  const loadJourney = async () => {
    if (!user) return;

    try {
      const gameEngine = new GameEngine(user.uid);
      const fetchedJourney = await gameEngine.loadJourney(journeyId);
      setJourney(fetchedJourney);
    } catch (error) {
      console.error('Error loading journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = () => {
    if (!selectedCar) return;
    router.push(`/journeys/${journeyId}/play?car=${selectedCar}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Journey Not Found</h1>
          <Link href="/journeys">
            <Button>Back to Journeys</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/journeys" className="text-primary-600 hover:text-primary-700">
            ← Back to Journeys
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Journey Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${journey.backgroundImageUrl})` }}
          />
          <div className="p-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
                {journey.stage.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{journey.title}</h1>
            <p className="text-gray-700 mb-6">{journey.description}</p>

            {/* Route Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Route Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start:</span>
                    <span className="font-medium">{journey.route.startLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End:</span>
                    <span className="font-medium">{journey.route.endLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{journey.route.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Duration:</span>
                    <span className="font-medium">{journey.route.estimatedDuration} min</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Journey Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Events:</span>
                    <span className="font-medium">{journey.events.length} scenarios</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{journey.avgScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completions:</span>
                    <span className="font-medium">{journey.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="font-medium">{journey.avgCompletionTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Car Selection */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Select Your Vehicle</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {Object.entries(CAR_TYPES).map(([key, car]) => (
              <button
                key={key}
                onClick={() => setSelectedCar(key as CarType)}
                disabled={!journey.requiredCar.includes(key)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  !journey.requiredCar.includes(key)
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                    : selectedCar === key
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 bg-white hover:border-primary-400'
                }`}
              >
                <div className="text-4xl mb-2">{car.icon}</div>
                <div className="font-bold text-lg">{car.name}</div>
                <div className="text-sm text-gray-600">{car.description}</div>
                {!journey.requiredCar.includes(key) && (
                  <div className="text-xs text-red-600 mt-2">Not available for this journey</div>
                )}
              </button>
            ))}
          </div>

          <Button
            onClick={handleStartJourney}
            disabled={!selectedCar}
            className="w-full"
            size="lg"
          >
            {selectedCar ? 'Start Journey' : 'Select a Vehicle'}
          </Button>
        </div>
      </main>
    </div>
  );
}

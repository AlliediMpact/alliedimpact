'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { GameEngine } from '@/lib/services/GameEngine';
import { MasteryService } from '@/lib/services/MasteryService';
import {
  GameState,
  Question,
  AnswerResult,
  JourneyResult,
  CAR_TYPES,
} from '@/lib/types/game';
import { Button } from '@allied-impact/ui';

export default function JourneyPlayPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const journeyId = params.journeyId as string;
  const carType = searchParams.get('car') || 'sedan';

  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [journeyResult, setJourneyResult] = useState<JourneyResult | null>(null);
  const [unlockedStage, setUnlockedStage] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    initializeJourney();
  }, [user, journeyId, carType]);

  const initializeJourney = async () => {
    if (!user) return;

    try {
      const engine = new GameEngine(user.uid);
      const state = await engine.startJourney(journeyId, carType);
      
      setGameEngine(engine);
      setGameState(state);
      setAnswerStartTime(Date.now());
    } catch (error) {
      console.error('Error initializing journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (optionId: string) => {
    if (!gameEngine || !gameState || !gameState.currentQuestion || answering) return;

    setAnswering(true);

    try {
      const timeToAnswer = Math.floor((Date.now() - answerStartTime) / 1000);
      const result = await gameEngine.validateAnswer(
        gameState.currentQuestion.questionId,
        optionId,
        timeToAnswer
      );

      setAnswerResult(result);

      // Update user credits in UI
      if (userProfile) {
        userProfile.credits += result.creditsAwarded;
      }
    } catch (error) {
      console.error('Error validating answer:', error);
    } finally {
      setAnswering(false);
    }
  };

  const handleContinue = async () => {
    if (!gameEngine) return;

    setAnswerResult(null);

    // Check if more events remain
    const hasMore = await gameEngine.advanceJourney();

    if (hasMore) {
      const updatedState = gameEngine.getGameState();
      setGameState(updatedState);
      setAnswerStartTime(Date.now());
    } else {
      // Journey complete
      const result = await gameEngine.endJourney();
      setJourneyResult(result);

      // Check for unlocked stages and new badges
      if (user && result.passed) {
        const masteryService = new MasteryService(user.uid);
        const newlyAwardedBadges = await masteryService.checkAndAwardBadges();
        setNewBadges(newlyAwardedBadges);

        // Check if new stage was unlocked
        if (gameState) {
          const advancement = await masteryService.checkAdvancement(gameState.journey.stage);
          if (advancement.canAdvance && advancement.nextStage) {
            setUnlockedStage(advancement.nextStage);
          }
        }
      }
      setJourneyComplete(true);
    }
  };

  const handleRetry = () => {
    router.push(`/journeys/${journeyId}/start`);
  };

  const han(
      <JourneyResultScreen
        result={journeyResult}
        onRetry={handleRetry}
        onExit={handleBackToJourneys}
        unlockedStage={unlockedStage}
        newBadges={newBadges}
      />
    )
    router.push('/journeys');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading journey...</p>
        </div>
      </div>
    );
  }

  if (journeyComplete && journeyResult) {
    return <JourneyResultScreen result={journeyResult} onRetry={handleRetry} onExit={handleBackToJourneys} />;
  }

  if (!gameState || !gameState.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Journey</h1>
          <Button onClick={handleBackToJourneys}>Back to Journeys</Button>
        </div>
      </div>
    );
  }

  const progress = ((gameState.currentEventIndex + 1) / gameState.journey.events.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">
                {CAR_TYPES[gameState.carType as keyof typeof CAR_TYPES]?.icon}{' '}
                {gameState.journey.title}
              </div>
              <div className="text-xs text-gray-500">
                Event {gameState.currentEventIndex + 1} of {gameState.journey.events.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">Credits: <span className="font-bold text-yellow-400">{userProfile?.credits || 0}</span></div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Event Scenario */}
        {gameState.currentEvent && (
          <div className="mb-8">
            <div
              className="h-64 rounded-lg bg-cover bg-center mb-4"
              style={{ backgroundImage: `url(${gameState.currentEvent.visualAssetUrl})` }}
            />
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {gameState.currentEvent.type === 'stop-sign' && '🛑'}
                  {gameState.currentEvent.type === 'traffic-light' && '🚦'}
                  {gameState.currentEvent.type === 'pedestrian' && '🚶'}
                  {gameState.currentEvent.type === 'merge' && '↔️'}
                  {gameState.currentEvent.type === 'parking' && '🅿️'}
                  {gameState.currentEvent.type === 'roundabout' && '⭕'}
                </span>
                <span className="font-semibold capitalize">
                  {gameState.currentEvent.type.replace('-', ' ')}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{gameState.currentEvent.description}</p>
            </div>
          </div>
        )}

        {/* Question */}
        {!answerResult ? (
          <QuestionCard
            question={gameState.currentQuestion}
            onAnswer={handleAnswerSubmit}
            disabled={answering}
          />
        ) : (
          <AnswerFeedback result={answerResult} onContinue={handleContinue} />
        )}
      </main>
    </div>
  );
}

function QuestionCard({
  question,
  onAnswer,
  disabled,
}: {
  question: Question;
  onAnswer: (optionId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">{question.text}</h2>

      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt="Question scenario"
          className="w-full rounded-lg mb-6"
        />
      )}

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswer(option.id)}
            disabled={disabled}
            className="w-full p-4 text-left rounded-lg border-2 border-gray-700 hover:border-primary-600 hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        K53 Reference: {question.k53Reference}
      </div>
    </div>
  );
}

function AnswerFeedback({
  result,
  onContinue,
}: {
  result: AnswerResult;
  onContinue: () => void;
}) {
  return (
    <div className={`rounded-lg p-8 ${result.isCorrect ? 'bg-green-900' : 'bg-red-900'}`}>
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{result.isCorrect ? '✅' : '❌'}</div>
        <h2 className="text-3xl font-bold mb-2">
          {result.isCorrect ? 'Correct!' : 'Incorrect'}
        </h2>
        <div className="text-xl">
  unlockedStage,
  newBadges,
}: {
  result: JourneyResult;
  onRetry: () => void;
  onExit: () => void;
  unlockedStage: string | null;
  newBadges: string[];
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-6">{result.passed ? '🎉' : '😔'}</div>
          
          <h1 className="text-4xl font-bold mb-4">
            {result.passed ? 'Journey Complete!' : 'Not Quite There Yet'}
          </h1>

          <div className="text-6xl font-bold mb-6">
            {result.score.toFixed(1)}%
          </div>

          <p className="text-gray-300 mb-8">{result.feedback}</p>

          {/* Unlocked Stage Alert */}
          {unlockedStage && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6 animate-pulse">
              <div className="text-3xl mb-2">🎊</div>
              <div className="text-xl font-bold mb-2">New Stage Unlocked!</div>
              <div className="text-lg capitalize">{unlockedStage} is now available</div>
            </div>
          )}

          {/* New Badges */}
          {newBadges.length > 0 && (
            <div className="bg-yellow-900 bg-opacity-50 border-2 border-yellow-500 rounded-lg p-4 mb-6">
              <div className="text-2xl mb-2">🏅</div>
              <div className="font-bold mb-2">New Badge{newBadges.length > 1 ? 's' : ''} Earned!</div>
              <div className="text-sm text-yellow-300">
                {newBadges.join(', ')}
              </div>
            </div>
          )}
function JourneyResultScreen({
  result,
  onRetry,
  onExit,
}: {
  result: JourneyResult;
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-6">{result.passed ? '🎉' : '😔'}</div>
          
          <h1 className="text-4xl font-bold mb-4">
            {result.passed ? 'Journey Complete!' : 'Not Quite There Yet'}
          </h1>

          <div className="text-6xl font-bold mb-6">
            {result.score.toFixed(1)}%
          </div>

          <p className="text-gray-300 mb-8">{result.feedback}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{result.correctAnswers}</div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{result.incorrectAnswers}</div>
              <div className="text-sm text-gray-400">Incorrect</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{result.creditsEarned > 0 ? '+' : ''}{result.creditsEarned}</div>
              <div className="text-sm text-gray-400">Credits</div>
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            Duration: {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={onRetry} variant="secondary" className="flex-1">
              {result.passed ? 'Play Again' : 'Retry'}
            </Button>
            <Button onClick={onExit} className="flex-1">
              Back to Journeys
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Timestamp } from 'firebase/firestore';

/**
 * Journey Definition
 * Matches drivemaster_journeys collection schema
 */
export interface Journey {
  journeyId: string;
  title: string;
  description: string;
  stage: Stage;
  route: Route;
  events: JourneyEvent[];
  thumbnailUrl: string;
  backgroundImageUrl: string;
  videoIntroUrl?: string;
  requiredCar: string[];
  prerequisiteJourneys: string[];
  avgCompletionTime: number;
  avgScore: number;
  totalAttempts: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Route {
  routeId: string;
  startLocation: string;
  endLocation: string;
  distance: number; // km
  estimatedDuration: number; // minutes
  mapImageUrl: string;
}

export interface JourneyEvent {
  eventId: string;
  type: EventType;
  position: number; // km from start
  questionIds: string[];
  visualAssetUrl: string;
  description: string;
}

export type EventType = 
  | 'stop-sign'
  | 'traffic-light'
  | 'pedestrian'
  | 'merge'
  | 'parking'
  | 'roundabout'
  | 'yield'
  | 'speed-limit'
  | 'school-zone'
  | 'railway-crossing';

/**
 * Question Definition
 * Matches drivemaster_questions collection schema
 */
export interface Question {
  questionId: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  explanation: string;
  k53Reference: string;
  k53PageNumber: number;
  stage: Stage;
  tags: string[];
  eventTypes: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  imageUrl?: string;
  videoUrl?: string;
  totalAsked: number;
  totalCorrect: number;
  totalIncorrect: number;
  avgTimeToAnswer: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'scenario';

export type Stage = 'beginner' | 'intermediate' | 'advanced' | 'k53';

/**
 * Journey Progress/Attempt
 * Matches drivemaster_users/{userId}/progress/{attemptId} subcollection
 */
export interface JourneyAttempt {
  journeyAttemptId: string;
  journeyId: string;
  stage: Stage;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date | null;
  duration: number; // seconds
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // percentage (0-100)
  passed: boolean;
  events: EventResult[];
  carType: string;
  routeId: string;
  wasOffline: boolean;
  syncedAt: Date | null;
}

export interface EventResult {
  eventId: string;
  eventType: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  timeToAnswer: number; // seconds
}

/**
 * Game State (in-memory during gameplay)
 */
export interface GameState {
  journeyId: string;
  journey: Journey;
  carType: string;
  currentEventIndex: number;
  currentEvent: JourneyEvent | null;
  currentQuestion: Question | null;
  events: EventResult[];
  startedAt: Date;
  isPaused: boolean;
  checkpointId: string | null;
}

/**
 * Answer Result (after user answers)
 */
export interface AnswerResult {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  creditsAwarded: number; // +10 or -5
  timeToAnswer: number;
}

/**
 * Journey Result (after completion)
 */
export interface JourneyResult {
  journeyId: string;
  score: number; // percentage
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  passed: boolean;
  canAdvance: boolean;
  feedback: string;
  creditsEarned: number;
  duration: number; // seconds
  events: EventResult[];
}

/**
 * Mastery Thresholds
 */
export const MASTERY_THRESHOLDS = {
  beginner: { min: 95, max: 100 },
  intermediate: { min: 97, max: 100 },
  advanced: { min: 98, max: 100 },
  k53: { min: 100, max: 100 },
} as const;

/**
 * Credit Rules
 */
export const CREDIT_RULES = {
  earn: {
    correctAnswer: 10,
    perfectJourney: 50,
    dailyLogin: 20,
    stageCompletion: 100,
    firstAttemptPerfect: 150,
  },
  lose: {
    incorrectAnswer: 5,
    skipQuestion: 10,
    quitJourney: 15,
  },
} as const;

/**
 * Car Types
 */
export type CarType = 'sedan' | 'hatchback' | 'suv' | 'bakkie';

export const CAR_TYPES: Record<CarType, { name: string; description: string; icon: string }> = {
  sedan: {
    name: 'Sedan',
    description: 'Standard 4-door vehicle',
    icon: '🚗',
  },
  hatchback: {
    name: 'Hatchback',
    description: 'Compact 3 or 5-door vehicle',
    icon: '🚙',
  },
  suv: {
    name: 'SUV',
    description: 'Sport Utility Vehicle',
    icon: '🚙',
  },
  bakkie: {
    name: 'Bakkie',
    description: 'Pickup truck',
    icon: '🛻',
  },
};

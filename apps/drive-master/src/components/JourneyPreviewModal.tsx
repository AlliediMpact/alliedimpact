'use client';

import { Button } from '@allied-impact/ui';
import { X, Clock, Target, BookOpen, Trophy } from 'lucide-react';

export interface JourneyPreviewModalProps {
  open: boolean;
  onClose: () => void;
  journey: {
    name: string;
    description: string;
    category: string;
    stageCount: number;
    totalQuestions: number;
    estimatedMinutes: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    masteryRequirement: number;
  };
  onStart: () => void;
}

export function JourneyPreviewModal({
  open,
  onClose,
  journey,
  onStart,
}: JourneyPreviewModalProps) {
  if (!open) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">{journey.name}</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {journey.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(journey.difficulty)}`}
            >
              {getDifficultyLabel(journey.difficulty)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">About This Journey</h3>
            <p className="text-gray-700 leading-relaxed">{journey.description}</p>
          </div>

          {/* Journey Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Questions */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Total Questions</div>
                <div className="text-2xl font-bold text-gray-900">{journey.totalQuestions}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {journey.stageCount} stages
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Estimated Time</div>
                <div className="text-2xl font-bold text-gray-900">{journey.estimatedMinutes}</div>
                <div className="text-xs text-gray-500 mt-1">minutes</div>
              </div>
            </div>

            {/* Mastery Requirement */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Mastery Required</div>
                <div className="text-2xl font-bold text-gray-900">{journey.masteryRequirement}%</div>
                <div className="text-xs text-gray-500 mt-1">to pass</div>
              </div>
            </div>

            {/* Certificate */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Reward</div>
                <div className="text-lg font-bold text-gray-900">Certificate</div>
                <div className="text-xs text-gray-500 mt-1">upon completion</div>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">What You'll Learn</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Master {journey.stageCount} key stages of driving knowledge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Answer {journey.totalQuestions} questions with instant feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Earn a verified certificate upon completion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Track your progress and performance metrics</span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded">
            <h4 className="font-semibold text-emerald-900 mb-1">💡 Pro Tip</h4>
            <p className="text-sm text-emerald-800">
              Take your time to read each question carefully. You can pause anytime and resume later.
              Use keyboard shortcuts (1-4 for answers, Enter to submit) for a faster experience!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onStart} className="bg-emerald-600 hover:bg-emerald-700">
            Start Journey
          </Button>
        </div>
      </div>
    </div>
  );
}

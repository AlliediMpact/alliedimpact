'use client';

import { useState } from 'react';
import { X, Trophy, Target, Clock, Zap } from 'lucide-react';

interface JourneyPreviewProps {
  journey: {
    id: string;
    name: string;
    description: string;
    stage: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
    totalQuestions: number;
    estimatedMinutes: number;
    masteryRequired: number;
    topicsCount: number;
  };
  onStart: () => void;
  onClose: () => void;
}

const difficultyConfig = {
  beginner: {
    color: 'green',
    label: 'Beginner',
    description: 'Perfect for those just starting their K53 journey',
    icon: '🌱',
  },
  intermediate: {
    color: 'blue',
    label: 'Intermediate',
    description: 'Build on your foundational knowledge',
    icon: '📚',
  },
  advanced: {
    color: 'purple',
    label: 'Advanced',
    description: 'Challenge yourself with complex scenarios',
    icon: '🎯',
  },
  expert: {
    color: 'orange',
    label: 'Expert',
    description: 'Master advanced driving concepts',
    icon: '⭐',
  },
  master: {
    color: 'red',
    label: 'Master',
    description: 'The ultimate K53 challenge',
    icon: '👑',
  },
};

export function JourneyPreviewModal({ journey, onStart, onClose }: JourneyPreviewProps) {
  const [isStarting, setIsStarting] = useState(false);
  const difficulty = difficultyConfig[journey.difficulty];

  const handleStart = () => {
    setIsStarting(true);
    onStart();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900">Journey Preview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Journey Title */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{journey.name}</h3>
              <p className="text-gray-600">{journey.description}</p>
            </div>

            {/* Difficulty Badge */}
            <div className={`bg-${difficulty.color}-50 border border-${difficulty.color}-200 rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{difficulty.icon}</span>
                <div>
                  <div className={`text-lg font-bold text-${difficulty.color}-900`}>
                    {difficulty.label} Level
                  </div>
                  <div className={`text-sm text-${difficulty.color}-700`}>
                    {difficulty.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-emerald-600" />
                  <div className="text-sm text-emerald-700 font-medium">Questions</div>
                </div>
                <div className="text-2xl font-bold text-emerald-900">
                  {journey.totalQuestions}
                </div>
                <div className="text-xs text-emerald-600 mt-1">
                  Across {journey.topicsCount} topics
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div className="text-sm text-blue-700 font-medium">Duration</div>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {journey.estimatedMinutes} min
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Estimated time
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  <div className="text-sm text-purple-700 font-medium">Mastery</div>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {journey.masteryRequired}%
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  Required to pass
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-orange-600" />
                  <div className="text-sm text-orange-700 font-medium">Stage</div>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {journey.stage}
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  Of 5 total stages
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">What to Expect</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-gray-900">Instant Feedback</div>
                    <div className="text-sm text-gray-600">
                      See correct answers and detailed explanations after each question
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-gray-900">Progress Tracking</div>
                    <div className="text-sm text-gray-600">
                      Monitor your score in real-time as you progress through the journey
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-gray-900">Earn Certificates</div>
                    <div className="text-sm text-gray-600">
                      Complete with {journey.masteryRequired}%+ to earn your certificate
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <div>
                    <div className="font-medium text-gray-900">Offline Support</div>
                    <div className="text-sm text-gray-600">
                      Your progress is saved automatically, even without internet
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="font-bold text-yellow-900 mb-2">💡 Pro Tips</div>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Take your time - there's no time limit per question</li>
                <li>• Read explanations carefully to understand the concepts</li>
                <li>• Use keyboard shortcuts (1-4) for faster answering</li>
                <li>• Press Esc to pause if you need a break</li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Starting Journey...' : '🚀 Start Journey'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Quick preview card component for dashboard
export function JourneyPreviewCard({
  journey,
  onPreview,
  onStart,
}: {
  journey: any;
  onPreview: () => void;
  onStart: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-xl font-bold mb-2">{journey.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{journey.description}</p>
      
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1 text-gray-600">
          <Target className="w-4 h-4" />
          {journey.totalQuestions}
        </span>
        <span className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4" />
          {journey.estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1 text-gray-600">
          <Trophy className="w-4 h-4" />
          {journey.masteryRequired}%
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Preview
        </button>
        <button
          onClick={onStart}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Start
        </button>
      </div>
    </div>
  );
}

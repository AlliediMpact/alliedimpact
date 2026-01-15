'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { JourneyAttemptService, JourneyAttempt } from '@/lib/services/JourneyAttemptService';
import { Button } from '@allied-impact/ui';
import { Calendar, Clock, Trophy, TrendingUp, Award } from 'lucide-react';

export default function JourneyHistoryPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<JourneyAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const journeyAttemptService = new JourneyAttemptService();
      const allAttempts = await journeyAttemptService.getUserAttempts(user.uid);
      
      // Sort by date (newest first)
      allAttempts.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      
      setAttempts(allAttempts);
    } catch (error) {
      console.error('Error loading journey history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter attempts
  const filteredAttempts = attempts.filter((attempt) => {
    if (filter === 'all') return true;
    if (filter === 'passed') return attempt.score >= attempt.masteryRequired;
    if (filter === 'failed') return attempt.score < attempt.masteryRequired;
    return true;
  });

  // Calculate stats
  const stats = {
    total: attempts.length,
    passed: attempts.filter((a) => a.score >= a.masteryRequired).length,
    failed: attempts.filter((a) => a.score < a.masteryRequired).length,
    averageScore: attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0,
    totalMinutes: Math.round(
      attempts.reduce((sum, a) => {
        if (a.completedAt && a.startedAt) {
          return sum + (a.completedAt.getTime() - a.startedAt.getTime()) / 60000;
        }
        return sum;
      }, 0)
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Journey History</h1>
              <p className="text-sm text-gray-600">Review your past journey attempts and progress</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold mb-2">No Journey History Yet</h2>
            <p className="text-gray-600 mb-6">
              Start your first journey to begin tracking your progress!
            </p>
            <Link href="/dashboard">
              <Button>Browse Journeys</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <StatCard
                icon={<Trophy className="w-6 h-6 text-emerald-600" />}
                label="Total Attempts"
                value={stats.total.toString()}
                bgColor="bg-emerald-50"
              />
              <StatCard
                icon={<Award className="w-6 h-6 text-blue-600" />}
                label="Passed"
                value={stats.passed.toString()}
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6 text-red-600" />}
                label="Failed"
                value={stats.failed.toString()}
                bgColor="bg-red-50"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                label="Avg Score"
                value={`${stats.averageScore}%`}
                bgColor="bg-purple-50"
              />
              <StatCard
                icon={<Clock className="w-6 h-6 text-orange-600" />}
                label="Total Time"
                value={`${stats.totalMinutes}m`}
                bgColor="bg-orange-50"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All ({attempts.length})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'passed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Passed ({stats.passed})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'failed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Failed ({stats.failed})
              </button>
            </div>

            {/* Attempts List */}
            <div className="space-y-4">
              {filteredAttempts.map((attempt) => (
                <AttemptCard key={attempt.attemptId} attempt={attempt} />
              ))}
            </div>

            {filteredAttempts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No {filter} attempts found
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function AttemptCard({ attempt }: { attempt: JourneyAttempt }) {
  const passed = attempt.score >= attempt.masteryRequired;
  const duration = attempt.completedAt && attempt.startedAt
    ? Math.round((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 60000)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {attempt.journeyName || 'Journey Attempt'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {attempt.startedAt.toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration} minutes
              </span>
            )}
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-lg font-bold ${
          passed
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {passed ? '✓ Passed' : '✗ Failed'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Final Score</div>
          <div className="text-2xl font-bold text-gray-900">{attempt.score}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Required</div>
          <div className="text-2xl font-bold text-gray-700">{attempt.masteryRequired}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Questions</div>
          <div className="text-2xl font-bold text-gray-700">
            {attempt.correctAnswers}/{attempt.totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${
            passed ? 'bg-emerald-600' : 'bg-red-600'
          }`}
          style={{ width: `${attempt.score}%` }}
        />
        {/* Mastery line */}
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-900"
          style={{ left: `${attempt.masteryRequired}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        <span>Mastery: {attempt.masteryRequired}%</span>
        <span>100%</span>
      </div>

      {attempt.certificateId && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span className="text-gray-700">
            Certificate earned:{' '}
            <Link
              href={`/certificates/${attempt.certificateId}`}
              className="text-emerald-600 hover:underline font-medium"
            >
              View Certificate
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}

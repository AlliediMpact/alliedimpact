'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { calculateDifficulty, DifficultyLevel } from '@/components/DifficultyBadge';

/**
 * Hook to fetch and calculate difficulty data for journeys
 * 
 * Queries Firestore for journey attempt statistics and calculates
 * difficulty levels based on pass rates.
 */
export function useDifficultyData(journeyId: string) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDifficultyData();
  }, [journeyId]);

  const fetchDifficultyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query journey attempts from Firestore
      // Collection: journey_attempts
      // Fields: journeyId, userId, score, passed, completedAt
      const attemptsRef = collection(db, 'journey_attempts');
      const q = query(attemptsRef, where('journeyId', '==', journeyId));
      const querySnapshot = await getDocs(q);

      let totalAttempts = 0;
      let passedAttempts = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalAttempts++;
        if (data.passed === true) {
          passedAttempts++;
        }
      });

      const calculatedDifficulty = calculateDifficulty(passedAttempts, totalAttempts);
      setDifficulty(calculatedDifficulty);
    } catch (err) {
      console.error('Error fetching difficulty data:', err);
      setError('Failed to load difficulty data');
      // Set default difficulty on error
      setDifficulty({
        level: 'medium',
        passRate: 50,
        totalAttempts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return { difficulty, loading, error };
}

/**
 * Hook to fetch difficulty data for multiple journeys at once
 * More efficient than calling useDifficultyData multiple times
 */
export function useBulkDifficultyData(journeyIds: string[]) {
  const [difficulties, setDifficulties] = useState<Record<string, DifficultyLevel>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (journeyIds.length > 0) {
      fetchBulkDifficultyData();
    }
  }, [JSON.stringify(journeyIds)]);

  const fetchBulkDifficultyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all attempts for the specified journeys
      const attemptsRef = collection(db, 'journey_attempts');
      const q = query(attemptsRef, where('journeyId', 'in', journeyIds.slice(0, 10))); // Firestore limit
      const querySnapshot = await getDocs(q);

      // Aggregate stats per journey
      const stats: Record<string, { total: number; passed: number }> = {};
      journeyIds.forEach((id) => {
        stats[id] = { total: 0, passed: 0 };
      });

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const journeyId = data.journeyId;
        if (stats[journeyId]) {
          stats[journeyId].total++;
          if (data.passed === true) {
            stats[journeyId].passed++;
          }
        }
      });

      // Calculate difficulty for each journey
      const calculatedDifficulties: Record<string, DifficultyLevel> = {};
      Object.keys(stats).forEach((journeyId) => {
        calculatedDifficulties[journeyId] = calculateDifficulty(
          stats[journeyId].passed,
          stats[journeyId].total
        );
      });

      setDifficulties(calculatedDifficulties);
    } catch (err) {
      console.error('Error fetching bulk difficulty data:', err);
      setError('Failed to load difficulty data');

      // Set default difficulties on error
      const defaultDifficulties: Record<string, DifficultyLevel> = {};
      journeyIds.forEach((id) => {
        defaultDifficulties[id] = {
          level: 'medium',
          passRate: 50,
          totalAttempts: 0,
        };
      });
      setDifficulties(defaultDifficulties);
    } finally {
      setLoading(false);
    }
  };

  return { difficulties, loading, error };
}

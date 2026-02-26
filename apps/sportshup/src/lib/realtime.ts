/**
 * Real-time Vote Updates using Firestore Listeners
 * Provides live vote tallies without manual refresh
 */

import { collection, doc, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { VoteTally } from '@/types';

export type VoteTallyCallback = (tallies: Record<string, Record<string, number>>) => void;

/**
 * Subscribe to real-time vote tallies for a specific tournament
 * Returns unsubscribe function to stop listening
 */
export function subscribeToTournamentResults(
  projectId: string,
  tournamentId: string,
  callback: VoteTallyCallback
): Unsubscribe {
  const talliesRef = collection(db, 'sportshub_projects', projectId, 'vote_tallies');
  const q = query(talliesRef, where('tournamentId', '==', tournamentId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tallies: Record<string, Record<string, number>> = {};

      snapshot.docs.forEach((doc) => {
        const tally = doc.data() as VoteTally;
        
        if (!tallies[tally.votingItemId]) {
          tallies[tally.votingItemId] = {};
        }

        tallies[tally.votingItemId][tally.option] = tally.totalVotes || 0;
      });

      callback(tallies);
    },
    (error) => {
      console.error('Error subscribing to tournament results:', error);
    }
  );
}

/**
 * Subscribe to a specific vote tally (single option)
 */
export function subscribeToVoteTally(
  projectId: string,
  tournamentId: string,
  votingItemId: string,
  optionId: string,
  callback: (count: number) => void
): Unsubscribe {
  const tallyId = `${projectId}_${tournamentId}_${votingItemId}_${optionId}`;
  const tallyRef = doc(db, 'sportshub_projects', projectId, 'vote_tallies', tallyId);

  return onSnapshot(
    tallyRef,
    (doc) => {
      if (doc.exists()) {
        const tally = doc.data() as VoteTally;
        callback(tally.totalVotes || 0);
      } else {
        callback(0);
      }
    },
    (error) => {
      console.error('Error subscribing to vote tally:', error);
    }
  );
}

/**
 * Subscribe to user's wallet balance for real-time updates
 */
export function subscribeToWalletBalance(
  userId: string,
  callback: (balance: number) => void
): Unsubscribe {
  const walletRef = doc(db, 'sportshub_wallets', userId);

  return onSnapshot(
    walletRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.balanceInCents || 0);
      } else {
        callback(0);
      }
    },
    (error) => {
      console.error('Error subscribing to wallet:', error);
    }
  );
}

/**
 * Subscribe to tournament status changes
 */
export function subscribeToTournamentStatus(
  projectId: string,
  tournamentId: string,
  callback: (status: 'draft' | 'open' | 'closed' | 'completed') => void
): Unsubscribe {
  const tournamentRef = doc(db, 'sportshub_projects', projectId, 'tournaments', tournamentId);

  return onSnapshot(
    tournamentRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.status);
      }
    },
    (error) => {
      console.error('Error subscribing to tournament status:', error);
    }
  );
}

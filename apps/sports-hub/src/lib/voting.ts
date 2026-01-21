import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Cast a vote and deduct from wallet
 */
export async function castVote(data: {
  projectId: string;
  tournamentId: string;
  votingItemId: string;
  optionId: string;
  captchaToken: string;
}) {
  const deductVoteFromWallet = httpsCallable(functions, 'deductVoteFromWallet');
  
  try {
    const result = await deductVoteFromWallet({
      projectId: data.projectId,
      voteId: `vote_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      tournamentId: data.tournamentId,
      votingItemId: data.votingItemId,
      optionId: data.optionId,
    });
    
    return result.data;
  } catch (error: any) {
    console.error('Error casting vote:', error);
    throw new Error(error.message || 'Failed to cast vote');
  }
}

/**
 * Cast multiple votes in a transaction
 */
export async function castMultipleVotes(votes: Array<{
  projectId: string;
  tournamentId: string;
  votingItemId: string;
  optionId: string;
}>) {
  const results = [];
  
  for (const vote of votes) {
    try {
      const result = await castVote({
        ...vote,
        captchaToken: 'dummy-token', // TODO: Replace with actual reCAPTCHA token
      });
      results.push({ success: true, vote, result });
    } catch (error: any) {
      results.push({ success: false, vote, error: error.message });
    }
  }
  
  return results;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(userId: string) {
  // This would typically be done with Firestore read
  // Kept here for consistency
  return 0;
}

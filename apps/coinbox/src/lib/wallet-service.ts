/**
 * Wallet Service - Stub Implementation
 * TODO: Implement full wallet service in Phase 8
 */

export interface UserWallet {
  userId: string;
  balance: number;
  lockedBalance: number;
  mainBalance: number;
  investmentBalance: number;
  commissionBalance: number;
  cryptoBalance: Record<string, number>;
  totalBalance: number;
}

/**
 * Get user wallet information
 * @param userId - User ID
 * @returns User wallet data
 */
export async function getUserWallet(userId: string): Promise<UserWallet> {
  // Stub implementation - returns empty wallet
  // TODO: Fetch from Firestore
  return {
    userId,
    balance: 0,
    lockedBalance: 0,
    mainBalance: 0,
    investmentBalance: 0,
    commissionBalance: 0,
    cryptoBalance: {},
    totalBalance: 0
  };
}

/**
 * Update wallet balance
 * @param userId - User ID
 * @param balanceType - Type of balance to update
 * @param amount - Amount to add/subtract
 */
export async function updateWalletBalance(
  userId: string,
  balanceType: 'main' | 'investment' | 'commission' | 'crypto',
  amount: number,
  cryptoAsset?: string
): Promise<void> {
  // Stub implementation
  // TODO: Update Firestore wallet document
  console.log(`[STUB] Updated ${balanceType} balance for user ${userId} by ${amount}`);
}

/**
 * Transfer between wallet accounts
 * @param userId - User ID
 * @param fromType - Source balance type
 * @param toType - Destination balance type
 * @param amount - Amount to transfer
 */
export async function transferBetweenBalances(
  userId: string,
  fromType: 'main' | 'investment' | 'commission',
  toType: 'main' | 'investment' | 'commission',
  amount: number
): Promise<void> {
  // Stub implementation
  // TODO: Transfer between wallet balances with validation
  console.log(`[STUB] Transferred ${amount} from ${fromType} to ${toType} for user ${userId}`);
}

export const walletService = {
  getUserWallet,
  updateWalletBalance,
  transferBetweenBalances
};

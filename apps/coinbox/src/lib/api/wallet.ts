/**
 * Wallet API Client
 * Frontend integration for wallet Cloud Functions
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase-client-config";

export interface WalletBalance {
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  metadata?: any;
}

/**
 * Initialize a deposit
 */
export const initializeDeposit = async (amount: number, email: string) => {
  const callable = httpsCallable(functions, "initializeDeposit");
  const result = await callable({ amount, email });
  return result.data;
};

/**
 * Verify deposit after Paystack payment
 */
export const verifyDeposit = async (reference: string) => {
  const callable = httpsCallable(functions, "verifyDeposit");
  const result = await callable({ reference });
  return result.data;
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (params: {
  amount: number;
  accountNumber: string;
  bankCode: string;
  accountName: string;
}) => {
  const callable = httpsCallable(functions, "requestWithdrawal");
  const result = await callable(params);
  return result.data;
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const callable = httpsCallable(functions, "getWalletBalance");
  const result = await callable({});
  return (result.data as any).data;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (
  limit = 50,
  type?: string
): Promise<Transaction[]> => {
  const callable = httpsCallable(functions, "getTransactionHistory");
  const result = await callable({ limit, type });
  return (result.data as any).data.transactions;
};

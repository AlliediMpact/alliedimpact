/**
 * Crypto Custody & Balance Types
 * Supports hybrid model: Luno custody + internal matching
 */

export type CryptoAsset = 'BTC' | 'ETH' | 'USDC' | 'XRP';

export interface AssetBalance {
  // Luno custody (secure storage)
  custodyBalance: number;
  
  // Available for trading (in our system)
  tradingBalance: number;
  
  // Locked in active orders
  lockedBalance: number;
  
  // Deposit address (from Luno)
  depositAddress: string;
  
  // Last sync with Luno
  lastSync: Date;
  
  // Total = custody + trading + locked
  get total(): number;
}

export interface CryptoWallet {
  userId: string;
  lunoAccountId: string;
  
  // Balances per asset
  assets: {
    [key in CryptoAsset]?: AssetBalance;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export type TransactionType = 
  | 'DEPOSIT'           // External → Luno
  | 'WITHDRAWAL'        // Luno → External
  | 'TRADE_BUY'         // Internal P2P buy
  | 'TRADE_SELL'        // Internal P2P sell
  | 'TRANSFER_IN'       // Received from another user
  | 'TRANSFER_OUT'      // Sent to another user
  | 'FEE'               // Platform fee collected
  | 'REFUND';           // Order cancelled refund

export type TransactionStatus = 
  | 'PENDING'           // Waiting for confirmation
  | 'CONFIRMING'        // On blockchain (deposits/withdrawals)
  | 'COMPLETED'         // Successfully completed
  | 'FAILED'            // Failed
  | 'CANCELLED';        // Cancelled by user

export interface CryptoTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  
  // Asset & amounts
  asset: CryptoAsset;
  amount: number;
  amountZAR: number;        // Value in ZAR at time of tx
  fee?: number;             // Network or platform fee
  
  // Balances before/after
  balanceBefore: number;
  balanceAfter: number;
  
  // Related entities
  orderId?: string;         // If related to order
  tradeId?: string;         // If part of trade
  txHash?: string;          // Blockchain tx hash
  fromAddress?: string;     // For deposits
  toAddress?: string;       // For withdrawals
  counterpartyId?: string;  // Other user in trade/transfer
  
  // Metadata
  notes?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  
  // Confirmations (for blockchain txs)
  confirmations?: number;
  requiredConfirmations?: number;
}

export interface BalanceUpdateRequest {
  userId: string;
  asset: CryptoAsset;
  amount: number;           // Positive = credit, Negative = debit
  type: 'custody' | 'trading' | 'locked';
  reason: TransactionType;
  orderId?: string;
  metadata?: Record<string, any>;
}

export interface BalanceLockRequest {
  userId: string;
  asset: CryptoAsset;
  amount: number;
  orderId: string;
  expiresAt?: Date;
}

export interface BalanceUnlockRequest {
  userId: string;
  asset: CryptoAsset;
  amount: number;
  orderId: string;
}

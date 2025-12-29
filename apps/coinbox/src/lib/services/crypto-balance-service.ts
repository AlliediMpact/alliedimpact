/**
 * Crypto Balance Service
 * Manages custody, trading, and locked balances for the hybrid model
 */

import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { 
  CryptoWallet, 
  CryptoAsset, 
  AssetBalance,
  CryptoTransaction,
  BalanceUpdateRequest,
  BalanceLockRequest,
  BalanceUnlockRequest,
  TransactionType,
  TransactionStatus
} from '../types/crypto-custody';

const COLLECTIONS = {
  CRYPTO_WALLETS: 'cryptoWallets',
  CRYPTO_TRANSACTIONS: 'cryptoTransactions',
} as const;

class CryptoBalanceService {
  private db = getFirestore();

  /**
   * Initialize crypto wallet for user
   */
  async initializeWallet(userId: string, lunoAccountId: string): Promise<CryptoWallet> {
    const walletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, userId);
    const existingWallet = await getDoc(walletRef);

    if (existingWallet.exists()) {
      return existingWallet.data() as CryptoWallet;
    }

    const wallet: CryptoWallet = {
      userId,
      lunoAccountId,
      assets: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };

    await setDoc(walletRef, wallet);
    console.log(`✅ Initialized crypto wallet for user ${userId}`);
    return wallet;
  }

  /**
   * Get user's crypto wallet
   */
  async getWallet(userId: string): Promise<CryptoWallet | null> {
    const walletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, userId);
    const walletDoc = await getDoc(walletRef);

    if (!walletDoc.exists()) {
      return null;
    }

    return walletDoc.data() as CryptoWallet;
  }

  /**
   * Get balance for specific asset
   */
  async getBalance(userId: string, asset: CryptoAsset): Promise<AssetBalance | null> {
    const wallet = await this.getWallet(userId);
    if (!wallet || !wallet.assets[asset]) {
      return null;
    }

    const balance = wallet.assets[asset]!;
    
    // Calculate total dynamically
    return {
      ...balance,
      get total() {
        return this.custodyBalance + this.tradingBalance + this.lockedBalance;
      }
    };
  }

  /**
   * Initialize asset if not exists
   */
  async initializeAsset(
    userId: string, 
    asset: CryptoAsset, 
    depositAddress: string
  ): Promise<void> {
    const walletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, userId);
    
    await updateDoc(walletRef, {
      [`assets.${asset}`]: {
        custodyBalance: 0,
        tradingBalance: 0,
        lockedBalance: 0,
        depositAddress,
        lastSync: new Date(),
      },
      updatedAt: new Date(),
    });
  }

  /**
   * Update balance (atomic operation)
   */
  async updateBalance(request: BalanceUpdateRequest): Promise<CryptoTransaction> {
    const { userId, asset, amount, type, reason, orderId, metadata } = request;

    return await runTransaction(this.db, async (transaction) => {
      const walletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, userId);
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data() as CryptoWallet;
      const assetBalance = wallet.assets[asset];

      if (!assetBalance) {
        throw new Error(`Asset ${asset} not initialized`);
      }

      // Calculate new balance
      const balanceKey = `${type}Balance` as keyof AssetBalance;
      const currentBalance = assetBalance[balanceKey] as number;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new Error(`Insufficient ${type} balance`);
      }

      // Update wallet
      transaction.update(walletRef, {
        [`assets.${asset}.${balanceKey}`]: newBalance,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      });

      // Create transaction record
      const txData: CryptoTransaction = {
        id: '', // Will be set by Firestore
        userId,
        type: reason,
        status: 'COMPLETED',
        asset,
        amount: Math.abs(amount),
        amountZAR: 0, // TODO: Calculate from current price
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        orderId,
        metadata,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      const txRef = await addDoc(
        collection(this.db, COLLECTIONS.CRYPTO_TRANSACTIONS),
        txData
      );

      txData.id = txRef.id;
      return txData;
    });
  }

  /**
   * Lock balance for order (move trading → locked)
   */
  async lockBalance(request: BalanceLockRequest): Promise<void> {
    const { userId, asset, amount, orderId } = request;

    await runTransaction(this.db, async (transaction) => {
      const walletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, userId);
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data() as CryptoWallet;
      const assetBalance = wallet.assets[asset];

      if (!assetBalance) {
        throw new Error(`Asset ${asset} not initialized`);
      }

      if (assetBalance.tradingBalance < amount) {
        throw new Error('Insufficient trading balance');
      }

      transaction.update(walletRef, {
        [`assets.${asset}.tradingBalance`]: assetBalance.tradingBalance - amount,
        [`assets.${asset}.lockedBalance`]: assetBalance.lockedBalance + amount,
        updatedAt: new Date(),
      });

      console.log(`🔒 Locked ${amount} ${asset} for order ${orderId}`);
    });
  }

  /**
   * Unlock balance (move locked → trading)
   */
  async unlockBalance(request: BalanceUnlockRequest): Promise<void> {
    const { userId, asset, amount, orderId } = request;

    await runTransaction(this.db, async (transaction) => {
      const walletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, userId);
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data() as CryptoWallet;
      const assetBalance = wallet.assets[asset];

      if (!assetBalance) {
        throw new Error(`Asset ${asset} not initialized`);
      }

      if (assetBalance.lockedBalance < amount) {
        throw new Error('Insufficient locked balance');
      }

      transaction.update(walletRef, {
        [`assets.${asset}.lockedBalance`]: assetBalance.lockedBalance - amount,
        [`assets.${asset}.tradingBalance`]: assetBalance.tradingBalance + amount,
        updatedAt: new Date(),
      });

      console.log(`🔓 Unlocked ${amount} ${asset} from order ${orderId}`);
    });
  }

  /**
   * Transfer between users (internal P2P trade)
   */
  async internalTransfer(
    fromUserId: string,
    toUserId: string,
    asset: CryptoAsset,
    amount: number,
    orderId?: string
  ): Promise<{ fromTx: CryptoTransaction; toTx: CryptoTransaction }> {
    return await runTransaction(this.db, async (transaction) => {
      // Get both wallets
      const fromWalletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, fromUserId);
      const toWalletRef = doc(this.db, COLLECTIONS.CRYPTO_WALLETS, toUserId);

      const [fromWalletDoc, toWalletDoc] = await Promise.all([
        transaction.get(fromWalletRef),
        transaction.get(toWalletRef),
      ]);

      if (!fromWalletDoc.exists() || !toWalletDoc.exists()) {
        throw new Error('Wallet not found');
      }

      const fromWallet = fromWalletDoc.data() as CryptoWallet;
      const toWallet = toWalletDoc.data() as CryptoWallet;

      const fromBalance = fromWallet.assets[asset];
      const toBalance = toWallet.assets[asset];

      if (!fromBalance || !toBalance) {
        throw new Error(`Asset ${asset} not initialized`);
      }

      // Check sender has sufficient balance (use locked balance for trades)
      if (fromBalance.lockedBalance < amount) {
        throw new Error('Insufficient locked balance');
      }

      // Update sender (locked → 0)
      transaction.update(fromWalletRef, {
        [`assets.${asset}.lockedBalance`]: fromBalance.lockedBalance - amount,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      });

      // Update receiver (trading +)
      transaction.update(toWalletRef, {
        [`assets.${asset}.tradingBalance`]: toBalance.tradingBalance + amount,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      });

      // Create transaction records
      const now = new Date();

      const fromTx: CryptoTransaction = {
        id: '',
        userId: fromUserId,
        type: 'TRANSFER_OUT',
        status: 'COMPLETED',
        asset,
        amount,
        amountZAR: 0,
        balanceBefore: fromBalance.lockedBalance,
        balanceAfter: fromBalance.lockedBalance - amount,
        orderId,
        counterpartyId: toUserId,
        createdAt: now,
        completedAt: now,
      };

      const toTx: CryptoTransaction = {
        id: '',
        userId: toUserId,
        type: 'TRANSFER_IN',
        status: 'COMPLETED',
        asset,
        amount,
        amountZAR: 0,
        balanceBefore: toBalance.tradingBalance,
        balanceAfter: toBalance.tradingBalance + amount,
        orderId,
        counterpartyId: fromUserId,
        createdAt: now,
        completedAt: now,
      };

      console.log(`✅ Internal transfer: ${amount} ${asset} from ${fromUserId} to ${toUserId}`);

      return { fromTx, toTx };
    });
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    options: { limit?: number; asset?: CryptoAsset; type?: TransactionType } = {}
  ): Promise<CryptoTransaction[]> {
    const { limit: txLimit = 50, asset, type } = options;

    let q = query(
      collection(this.db, COLLECTIONS.CRYPTO_TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(txLimit)
    );

    if (asset) {
      q = query(q, where('asset', '==', asset));
    }

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CryptoTransaction));
  }

  /**
   * Get all balances for user
   */
  async getAllBalances(userId: string): Promise<Record<CryptoAsset, AssetBalance | null>> {
    const wallet = await this.getWallet(userId);
    
    if (!wallet) {
      return {
        BTC: null,
        ETH: null,
        USDC: null,
        XRP: null,
      };
    }

    const balances: Record<string, AssetBalance | null> = {};
    const assets: CryptoAsset[] = ['BTC', 'ETH', 'USDC', 'XRP'];

    for (const asset of assets) {
      if (wallet.assets[asset]) {
        const balance = wallet.assets[asset]!;
        balances[asset] = {
          ...balance,
          get total() {
            return this.custodyBalance + this.tradingBalance + this.lockedBalance;
          }
        };
      } else {
        balances[asset] = null;
      }
    }

    return balances as Record<CryptoAsset, AssetBalance | null>;
  }
}

export const cryptoBalanceService = new CryptoBalanceService();

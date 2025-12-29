/**
 * Internal P2P Matching Engine
 * 
 * Handles order matching WITHOUT going through blockchain
 * Works with Luno custody service for secure storage
 * 
 * Benefits:
 * - Instant trades (no blockchain confirmation wait)
 * - Zero blockchain fees
 * - Better liquidity (can match partial orders)
 * - Full control over matching algorithm
 */

import { lunoCustodyService, CryptoAsset } from './luno-custody-service';
import { calculateP2PFee } from '../p2p-limits';

export type OrderType = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'PARTIAL' | 'FILLED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  asset: CryptoAsset;
  amount: number; // Amount of crypto
  price: number; // Price in ZAR per unit
  filled: number; // Amount filled so far
  status: OrderStatus;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  asset: CryptoAsset;
  amount: number; // Crypto amount
  price: number; // Price per unit
  totalZAR: number; // amount * price
  fee: number; // Platform fee (0.5%)
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  completedAt?: Date;
  createdAt: Date;
}

class InternalMatchingEngine {
  /**
   * Place a new order in the order book
   */
  async placeOrder(order: Omit<Order, 'id' | 'filled' | 'status' | 'createdAt'>): Promise<Order> {
    console.log(`📝 Placing ${order.type} order: ${order.amount} ${order.asset} @ R${order.price}`);

    // 1. Validate user has sufficient balance
    if (order.type === 'SELL') {
      const available = await lunoCustodyService.getAvailableBalance(order.userId, order.asset);
      if (available < order.amount) {
        throw new Error('Insufficient balance');
      }

      // 2. Lock the crypto amount
      // TODO: Move from tradingBalance to lockedBalance
    }

    // 3. Create order
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filled: 0,
      status: 'PENDING',
      createdAt: new Date(),
    };

    // 4. Save to Firestore
    // TODO: await saveOrderToFirestore(newOrder);

    // 5. Try to match immediately
    await this.matchOrder(newOrder);

    return newOrder;
  }

  /**
   * Match an order against existing orders in the book
   */
  private async matchOrder(order: Order): Promise<void> {
    console.log(`🔍 Looking for matches for order ${order.id}`);

    // 1. Get counter orders (buys for sells, sells for buys)
    const counterOrders = await this.getCounterOrders(order);

    if (counterOrders.length === 0) {
      console.log('📚 No matches found - added to order book');
      return;
    }

    // 2. Match with best prices first
    let remainingAmount = order.amount - order.filled;

    for (const counterOrder of counterOrders) {
      if (remainingAmount <= 0) break;

      // Check if prices match
      const canMatch = order.type === 'BUY'
        ? order.price >= counterOrder.price // Buyer willing to pay at least seller's ask
        : order.price <= counterOrder.price; // Seller willing to accept at least buyer's bid

      if (!canMatch) continue;

      // Calculate fill amount
      const counterRemaining = counterOrder.amount - counterOrder.filled;
      const fillAmount = Math.min(remainingAmount, counterRemaining);

      // Execute trade
      await this.executeTrade({
        buyOrder: order.type === 'BUY' ? order : counterOrder,
        sellOrder: order.type === 'SELL' ? order : counterOrder,
        amount: fillAmount,
        price: counterOrder.price, // Use maker's price
      });

      remainingAmount -= fillAmount;
    }

    // 3. Update order status
    if (remainingAmount <= 0) {
      order.status = 'FILLED';
      console.log('✅ Order fully filled');
    } else if (order.filled > 0) {
      order.status = 'PARTIAL';
      console.log(`⏳ Order partially filled: ${order.filled}/${order.amount}`);
    }
  }

  /**
   * Execute a trade between two orders
   */
  private async executeTrade(params: {
    buyOrder: Order;
    sellOrder: Order;
    amount: number;
    price: number;
  }): Promise<Trade> {
    const { buyOrder, sellOrder, amount, price } = params;
    const totalZAR = amount * price;
    const fee = calculateP2PFee(totalZAR);

    console.log(`💱 Executing trade: ${amount} ${buyOrder.asset} @ R${price} (Total: R${totalZAR})`);

    const trade: Trade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      asset: buyOrder.asset,
      amount,
      price,
      totalZAR,
      fee,
      status: 'PENDING',
      createdAt: new Date(),
    };

    try {
      // 1. Transfer crypto from seller to buyer (INSTANT - internal transfer)
      await lunoCustodyService.internalTransfer({
        fromUserId: sellOrder.userId,
        toUserId: buyOrder.userId,
        asset: buyOrder.asset,
        amount,
        orderId: trade.id,
        type: 'trade',
      });

      // 2. Transfer ZAR from buyer to seller (TODO: integrate with wallet service)
      // await walletService.internalTransfer({
      //   fromUserId: buyOrder.userId,
      //   toUserId: sellOrder.userId,
      //   amount: totalZAR - fee,
      // });

      // 3. Collect platform fee
      // await walletService.collectFee(sellOrder.userId, fee);

      // 4. Update order fill amounts
      buyOrder.filled += amount;
      sellOrder.filled += amount;

      // 5. Mark trade as completed
      trade.status = 'COMPLETED';
      trade.completedAt = new Date();

      console.log('✅ Trade executed successfully');

      // 6. Save trade to Firestore
      // TODO: await saveTradeToFirestore(trade);

      return trade;
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      trade.status = 'FAILED';
      throw error;
    }
  }

  /**
   * Get counter orders for matching
   */
  private async getCounterOrders(order: Order): Promise<Order[]> {
    // TODO: Query Firestore for counter orders
    // - Same asset
    // - Opposite type
    // - Status = PENDING or PARTIAL
    // - Sort by price (best first)
    
    return []; // Mock for now
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, userId: string): Promise<void> {
    console.log(`❌ Cancelling order ${orderId}`);

    // 1. Get order
    // const order = await getOrderFromFirestore(orderId);

    // 2. Verify ownership
    // if (order.userId !== userId) throw new Error('Unauthorized');

    // 3. Unlock any locked funds
    // if (order.type === 'SELL' && order.filled < order.amount) {
    //   const lockedAmount = order.amount - order.filled;
    //   await unlockCrypto(userId, order.asset, lockedAmount);
    // }

    // 4. Update status
    // order.status = 'CANCELLED';
    // await updateOrderInFirestore(order);

    console.log('✅ Order cancelled');
  }

  /**
   * Get order book (market depth)
   */
  async getOrderBook(asset: CryptoAsset, depth: number = 10): Promise<{
    bids: Order[]; // Buy orders
    asks: Order[]; // Sell orders
  }> {
    // TODO: Query Firestore
    // Bids: BUY orders sorted by price DESC (highest first)
    // Asks: SELL orders sorted by price ASC (lowest first)

    return {
      bids: [],
      asks: [],
    };
  }

  /**
   * Get user's active orders
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    // TODO: Query Firestore for user's PENDING and PARTIAL orders
    return [];
  }

  /**
   * Get user's trade history
   */
  async getUserTrades(userId: string, limit: number = 50): Promise<Trade[]> {
    // TODO: Query Firestore for completed trades
    return [];
  }

  /**
   * Get market price (mid-point between best bid and ask)
   */
  async getMarketPrice(asset: CryptoAsset): Promise<number> {
    const orderBook = await this.getOrderBook(asset, 1);
    
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return 0; // No market yet
    }

    const bestBid = orderBook.bids[0].price;
    const bestAsk = orderBook.asks[0].price;
    
    return (bestBid + bestAsk) / 2;
  }
}

// Singleton instance
export const matchingEngine = new InternalMatchingEngine();

/**
 * Mock Data for P2P Marketplace UI
 * Phase 1: UI Only - No backend integration
 */

export type PaymentMethod = 'Bank Transfer' | 'PayPal' | 'Cash App' | 'Venmo' | 'Zelle' | 'Wise' | 'Mobile Money';
export type OfferType = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'payment-pending' | 'completed' | 'cancelled' | 'disputed';
export type AssetType = 'BTC' | 'ETH' | 'USDT' | 'USDC';

export interface P2POffer {
  id: string;
  type: OfferType;
  asset: AssetType;
  price: number;
  priceType: 'fixed' | 'floating';
  floatPercentage?: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: PaymentMethod[];
  terms: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalTrades: number;
    completionRate: number;
    verificationLevel: 'basic' | 'verified' | 'premium';
    responseTime: string;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface P2POrder {
  id: string;
  offerId: string;
  offer: P2POffer;
  buyer: {
    id: string;
    name: string;
    avatar: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  amount: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentDeadline: Date;
  createdAt: Date;
  completedAt?: Date;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'payment-proof';
  attachmentUrl?: string;
}

// Mock Offers Data
export const mockOffers: P2POffer[] = [
  {
    id: 'offer-1',
    type: 'sell',
    asset: 'BTC',
    price: 42500,
    priceType: 'fixed',
    minLimit: 50,
    maxLimit: 5000,
    availableAmount: 0.5,
    paymentMethods: ['Bank Transfer', 'PayPal', 'Wise'],
    terms: 'Fast release. Payment within 30 minutes. Include order ID in transfer notes.',
    seller: {
      id: 'user-1',
      name: 'CryptoKing',
      avatar: '/avatars/user-1.jpg',
      rating: 4.9,
      totalTrades: 245,
      completionRate: 98.5,
      verificationLevel: 'premium',
      responseTime: '2 min',
    },
    createdAt: new Date(Date.now() - 3600000),
    isActive: true,
  },
  {
    id: 'offer-2',
    type: 'buy',
    asset: 'ETH',
    price: 2250,
    priceType: 'floating',
    floatPercentage: 1.5,
    minLimit: 100,
    maxLimit: 10000,
    availableAmount: 10,
    paymentMethods: ['Bank Transfer', 'Cash App', 'Zelle'],
    terms: 'Looking to buy ETH. Quick payment guaranteed. Must have KYC verified.',
    seller: {
      id: 'user-2',
      name: 'EthTrader',
      avatar: '/avatars/user-2.jpg',
      rating: 4.7,
      totalTrades: 156,
      completionRate: 96.2,
      verificationLevel: 'verified',
      responseTime: '5 min',
    },
    createdAt: new Date(Date.now() - 7200000),
    isActive: true,
  },
  {
    id: 'offer-3',
    type: 'sell',
    asset: 'USDT',
    price: 1.00,
    priceType: 'fixed',
    minLimit: 20,
    maxLimit: 2000,
    availableAmount: 50000,
    paymentMethods: ['Mobile Money', 'Bank Transfer'],
    terms: 'Instant release for verified buyers. No third-party payments.',
    seller: {
      id: 'user-3',
      name: 'StableCoinPro',
      avatar: '/avatars/user-3.jpg',
      rating: 5.0,
      totalTrades: 892,
      completionRate: 99.8,
      verificationLevel: 'premium',
      responseTime: '1 min',
    },
    createdAt: new Date(Date.now() - 1800000),
    isActive: true,
  },
  {
    id: 'offer-4',
    type: 'sell',
    asset: 'BTC',
    price: 42300,
    priceType: 'floating',
    floatPercentage: -0.5,
    minLimit: 100,
    maxLimit: 10000,
    availableAmount: 1.2,
    paymentMethods: ['Venmo', 'Cash App', 'Zelle'],
    terms: 'Below market price! Payment in 15 minutes required.',
    seller: {
      id: 'user-4',
      name: 'QuickBTC',
      avatar: '/avatars/user-4.jpg',
      rating: 4.6,
      totalTrades: 78,
      completionRate: 94.5,
      verificationLevel: 'verified',
      responseTime: '10 min',
    },
    createdAt: new Date(Date.now() - 5400000),
    isActive: true,
  },
  {
    id: 'offer-5',
    type: 'buy',
    asset: 'USDC',
    price: 1.00,
    priceType: 'fixed',
    minLimit: 50,
    maxLimit: 5000,
    availableAmount: 25000,
    paymentMethods: ['PayPal', 'Wise'],
    terms: 'Buying USDC for long-term hold. Fast payment via PayPal.',
    seller: {
      id: 'user-5',
      name: 'StableInvestor',
      avatar: '/avatars/user-5.jpg',
      rating: 4.8,
      totalTrades: 312,
      completionRate: 97.8,
      verificationLevel: 'premium',
      responseTime: '3 min',
    },
    createdAt: new Date(Date.now() - 10800000),
    isActive: true,
  },
];

// Mock Orders Data
export const mockOrders: P2POrder[] = [
  {
    id: 'order-1',
    offerId: 'offer-1',
    offer: mockOffers[0],
    buyer: {
      id: 'current-user',
      name: 'You',
      avatar: '/avatars/current-user.jpg',
    },
    seller: mockOffers[0].seller,
    amount: 0.05,
    totalPrice: 2125,
    status: 'payment-pending',
    paymentMethod: 'Bank Transfer',
    paymentDeadline: new Date(Date.now() + 1200000), // 20 minutes from now
    createdAt: new Date(Date.now() - 300000),
    chatMessages: [
      {
        id: 'msg-1',
        senderId: 'system',
        senderName: 'System',
        message: 'Order created. Please complete payment within 30 minutes.',
        timestamp: new Date(Date.now() - 300000),
        type: 'system',
      },
      {
        id: 'msg-2',
        senderId: 'user-1',
        senderName: 'CryptoKing',
        message: 'Hello! Please send payment to the account details provided. Include order ID: order-1 in the notes.',
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
      },
      {
        id: 'msg-3',
        senderId: 'current-user',
        senderName: 'You',
        message: 'Payment sent! Uploading proof now.',
        timestamp: new Date(Date.now() - 60000),
        type: 'text',
      },
    ],
  },
  {
    id: 'order-2',
    offerId: 'offer-3',
    offer: mockOffers[2],
    buyer: {
      id: 'current-user',
      name: 'You',
      avatar: '/avatars/current-user.jpg',
    },
    seller: mockOffers[2].seller,
    amount: 1000,
    totalPrice: 1000,
    status: 'completed',
    paymentMethod: 'Mobile Money',
    paymentDeadline: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 7200000),
    completedAt: new Date(Date.now() - 3000000),
    chatMessages: [
      {
        id: 'msg-4',
        senderId: 'system',
        senderName: 'System',
        message: 'Order completed successfully!',
        timestamp: new Date(Date.now() - 3000000),
        type: 'system',
      },
    ],
  },
];

// Mock Chat Messages for Order Detail
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'system',
    senderName: 'System',
    message: 'Order created. Buyer must complete payment within 30 minutes.',
    timestamp: new Date(Date.now() - 600000),
    type: 'system',
  },
  {
    id: 'msg-2',
    senderId: 'seller-1',
    senderName: 'CryptoKing',
    message: 'Hi! Please send the payment to the bank account shown above. Make sure to include the order reference number.',
    timestamp: new Date(Date.now() - 540000),
    type: 'text',
  },
  {
    id: 'msg-3',
    senderId: 'buyer-1',
    senderName: 'You',
    message: 'Sure, sending payment now.',
    timestamp: new Date(Date.now() - 480000),
    type: 'text',
  },
  {
    id: 'msg-4',
    senderId: 'buyer-1',
    senderName: 'You',
    message: 'Payment sent! Here is the proof.',
    timestamp: new Date(Date.now() - 120000),
    type: 'payment-proof',
    attachmentUrl: '/proof/payment-1.jpg',
  },
  {
    id: 'msg-5',
    senderId: 'seller-1',
    senderName: 'CryptoKing',
    message: 'Thanks! Verifying now...',
    timestamp: new Date(Date.now() - 60000),
    type: 'text',
  },
];

// Payment Methods with Icons
export const paymentMethodIcons: Record<PaymentMethod, string> = {
  'Bank Transfer': '🏦',
  'PayPal': '💰',
  'Cash App': '💵',
  'Venmo': '💸',
  'Zelle': '💳',
  'Wise': '🌍',
  'Mobile Money': '📱',
};

// Asset Icons
export const assetIcons: Record<AssetType, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  USDC: '$',
};

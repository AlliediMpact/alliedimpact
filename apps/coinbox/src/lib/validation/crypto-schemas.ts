import { z } from 'zod';

// Crypto Asset Types
export const CryptoAssetSchema = z.enum(['BTC', 'ETH', 'USDT', 'SOL', 'XRP']);

// Order Type
export const OrderTypeSchema = z.enum(['BUY', 'SELL']);

// Order Status
export const OrderStatusSchema = z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'PARTIAL']);

// Create Order Schema
export const CreateOrderSchema = z.object({
  asset: CryptoAssetSchema,
  type: OrderTypeSchema,
  price: z.number().positive('Price must be positive'),
  amount: z.number().positive('Amount must be positive'),
});

// Update Order Schema
export const UpdateOrderSchema = z.object({
  status: OrderStatusSchema.optional(),
  filled: z.number().min(0).optional(),
  remaining: z.number().min(0).optional(),
});

// Balance Update Schema
export const BalanceUpdateSchema = z.object({
  asset: CryptoAssetSchema,
  amount: z.number().positive('Amount must be positive'),
  operation: z.enum(['add', 'subtract']),
});

// P2P Listing Schema
export const P2PListingSchema = z.object({
  asset: CryptoAssetSchema,
  type: z.enum(['buy', 'sell']),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().positive('Price must be positive'),
  minAmount: z.number().positive('Minimum amount must be positive').optional(),
  maxAmount: z.number().positive('Maximum amount must be positive').optional(),
  paymentMethods: z.array(z.string()).min(1, 'At least one payment method required'),
  terms: z.string().max(500, 'Terms cannot exceed 500 characters').optional(),
}).refine(
  (data) => !data.minAmount || !data.maxAmount || data.minAmount <= data.maxAmount,
  { message: 'Minimum amount must be less than or equal to maximum amount' }
);

// Transaction Schema
export const TransactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'trade', 'transfer']),
  asset: CryptoAssetSchema,
  amount: z.number().positive('Amount must be positive'),
  recipientAddress: z.string().optional(),
  memo: z.string().max(200, 'Memo cannot exceed 200 characters').optional(),
});

// User ID Schema
export const UserIdSchema = z.string().uuid('Invalid user ID format').or(
  z.string().regex(/^[a-zA-Z0-9_-]{28}$/, 'Invalid Firebase user ID format')
);

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// Query Params Schema
export const OrderQuerySchema = z.object({
  asset: CryptoAssetSchema.optional(),
  status: OrderStatusSchema.optional(),
  myOrders: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

// Sanitization helper
export function sanitizeString(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

// Validate and sanitize helper
export function validateAndSanitize<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Address validation (basic)
export const CryptoAddressSchema = z.object({
  BTC: z.string().regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, 'Invalid Bitcoin address'),
  ETH: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  USDT: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid USDT address (ERC-20)'),
  SOL: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address'),
  XRP: z.string().regex(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/, 'Invalid Ripple address'),
});

export type CryptoAsset = z.infer<typeof CryptoAssetSchema>;
export type OrderType = z.infer<typeof OrderTypeSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type P2PListingInput = z.infer<typeof P2PListingSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;

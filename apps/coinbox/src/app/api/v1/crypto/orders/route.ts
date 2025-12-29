// GET /api/v1/crypto/orders - List crypto orders
// POST /api/v1/crypto/orders - Create crypto order
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError, apiPaginated } from '@/lib/api-middleware';
import { db } from '@/lib/firebase';
import { createCryptoOrder } from '@/lib/crypto-service';

export const GET = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Pagination
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
      const offset = (page - 1) * limit;

      // Filters
      const orderType = searchParams.get('orderType');
      const status = searchParams.get('status');
      const crypto = searchParams.get('crypto');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      let query = db.collection('cryptoOrders')
        .where('userId', '==', context.apiKey.userId);

      // Apply filters
      if (orderType) {
        query = query.where('orderType', '==', orderType);
      }
      if (status) {
        query = query.where('status', '==', status);
      }
      if (crypto) {
        query = query.where('crypto', '==', crypto.toUpperCase());
      }

      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply sorting and pagination
      query = query.orderBy(sortBy, sortOrder as any).limit(limit).offset(offset);

      const snapshot = await query.get();
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return apiPaginated(orders, page, limit, total);
    } catch (error) {
      console.error('Error listing crypto orders:', error);
      return apiError('Failed to list crypto orders', 500);
    }
  },
  ['read:crypto']
);

export const POST = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();

      // Validate required fields
      const { 
        crypto,
        orderType,
        amount,
        price 
      } = body;

      if (!crypto || !orderType || !amount) {
        return apiError('Missing required fields: crypto, orderType, amount', 400);
      }

      // Validate order type
      const validOrderTypes = ['buy', 'sell'];
      if (!validOrderTypes.includes(orderType)) {
        return apiError(`Invalid order type. Must be one of: ${validOrderTypes.join(', ')}`, 400);
      }

      // Validate amount
      if (typeof amount !== 'number' || amount <= 0) {
        return apiError('Invalid amount', 400);
      }

      // Validate price if provided (for limit orders)
      if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        return apiError('Invalid price', 400);
      }

      // Validate crypto symbol
      const validCryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'];
      if (!validCryptos.includes(crypto.toUpperCase())) {
        return apiError(`Invalid crypto. Must be one of: ${validCryptos.join(', ')}`, 400);
      }

      // Create crypto order
      const order = await createCryptoOrder({
        userId: context.apiKey.userId,
        crypto: crypto.toUpperCase(),
        orderType,
        amount,
        price: price || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdVia: 'api',
        apiKeyId: context.apiKey.id,
      });

      return apiSuccess(
        {
          order: {
            id: order.id,
            crypto: order.crypto,
            orderType: order.orderType,
            amount: order.amount,
            price: order.price,
            status: order.status,
            createdAt: order.createdAt,
          },
          message: 'Crypto order created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating crypto order:', error);
      return apiError('Failed to create crypto order', 500);
    }
  },
  ['write:crypto']
);

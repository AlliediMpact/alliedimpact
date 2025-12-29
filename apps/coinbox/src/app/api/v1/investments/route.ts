// GET /api/v1/investments - List investments
// POST /api/v1/investments - Create investment
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError, apiPaginated } from '@/lib/api-middleware';
import { db } from '@/lib/firebase';
import { createInvestment } from '@/lib/investment-service';

export const GET = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Pagination
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
      const offset = (page - 1) * limit;

      // Filters
      const status = searchParams.get('status');
      const type = searchParams.get('type');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      let query = db.collection('investments')
        .where('userId', '==', context.apiKey.userId);

      // Apply filters
      if (status) {
        query = query.where('status', '==', status);
      }
      if (type) {
        query = query.where('type', '==', type);
      }

      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply sorting and pagination
      query = query.orderBy(sortBy, sortOrder as any).limit(limit).offset(offset);

      const snapshot = await query.get();
      const investments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return apiPaginated(investments, page, limit, total);
    } catch (error) {
      console.error('Error listing investments:', error);
      return apiError('Failed to list investments', 500);
    }
  },
  ['read:investments']
);

export const POST = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();

      // Validate required fields
      const { 
        amount, 
        type,
        asset,
        expectedReturn,
        duration 
      } = body;

      if (!amount || !type || !asset) {
        return apiError('Missing required fields: amount, type, asset', 400);
      }

      // Validate amount
      if (typeof amount !== 'number' || amount <= 0) {
        return apiError('Invalid amount', 400);
      }

      // Validate type
      const validTypes = ['stocks', 'bonds', 'mutual_funds', 'etf', 'real_estate', 'crypto', 'commodities'];
      if (!validTypes.includes(type)) {
        return apiError(`Invalid investment type. Must be one of: ${validTypes.join(', ')}`, 400);
      }

      // Validate expected return if provided
      if (expectedReturn !== undefined && (typeof expectedReturn !== 'number' || expectedReturn < -100)) {
        return apiError('Invalid expected return', 400);
      }

      // Validate duration if provided
      if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
        return apiError('Invalid duration', 400);
      }

      // Create investment
      const investment = await createInvestment({
        userId: context.apiKey.userId,
        amount,
        type,
        asset,
        expectedReturn: expectedReturn || 0,
        duration: duration || 12,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdVia: 'api',
        apiKeyId: context.apiKey.id,
      });

      return apiSuccess(
        {
          investment: {
            id: investment.id,
            amount: investment.amount,
            type: investment.type,
            asset: investment.asset,
            expectedReturn: investment.expectedReturn,
            duration: investment.duration,
            status: investment.status,
            createdAt: investment.createdAt,
          },
          message: 'Investment created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating investment:', error);
      return apiError('Failed to create investment', 500);
    }
  },
  ['write:investments']
);

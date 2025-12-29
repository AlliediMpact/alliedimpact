// GET /api/v1/transactions - List transactions
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiError, apiPaginated } from '@/lib/api-middleware';
import { db } from '@/lib/firebase';

export const GET = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Pagination
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
      const offset = (page - 1) * limit;

      // Filters
      const type = searchParams.get('type');
      const status = searchParams.get('status');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      let query = db.collection('transactions')
        .where('userId', '==', context.apiKey.userId);

      // Apply filters
      if (type) {
        query = query.where('type', '==', type);
      }
      if (status) {
        query = query.where('status', '==', status);
      }
      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }
      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }

      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply sorting and pagination
      query = query.orderBy(sortBy, sortOrder as any).limit(limit).offset(offset);

      const snapshot = await query.get();
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return apiPaginated(transactions, page, limit, total);
    } catch (error) {
      console.error('Error listing transactions:', error);
      return apiError('Failed to list transactions', 500);
    }
  },
  ['read:transactions']
);

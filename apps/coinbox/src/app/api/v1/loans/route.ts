// GET /api/v1/loans - List loans
// POST /api/v1/loans - Create loan
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError, apiPaginated } from '@/lib/api-middleware';
import { db } from '@/lib/firebase';
import { createLoan } from '@/lib/loan-service';

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

      let query = db.collection('loans')
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
      const loans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return apiPaginated(loans, page, limit, total);
    } catch (error) {
      console.error('Error listing loans:', error);
      return apiError('Failed to list loans', 500);
    }
  },
  ['read:loans']
);

export const POST = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();

      // Validate required fields
      const { 
        amount, 
        interestRate, 
        term, 
        type,
        purpose,
        collateral 
      } = body;

      if (!amount || !interestRate || !term || !type) {
        return apiError('Missing required fields: amount, interestRate, term, type', 400);
      }

      // Validate amount
      if (typeof amount !== 'number' || amount <= 0) {
        return apiError('Invalid amount', 400);
      }

      // Validate interest rate
      if (typeof interestRate !== 'number' || interestRate < 0 || interestRate > 100) {
        return apiError('Invalid interest rate', 400);
      }

      // Validate term
      if (typeof term !== 'number' || term <= 0) {
        return apiError('Invalid term', 400);
      }

      // Validate type
      const validTypes = ['personal', 'business', 'mortgage', 'auto', 'student'];
      if (!validTypes.includes(type)) {
        return apiError(`Invalid loan type. Must be one of: ${validTypes.join(', ')}`, 400);
      }

      // Create loan
      const loan = await createLoan({
        userId: context.apiKey.userId,
        amount,
        interestRate,
        term,
        type,
        purpose: purpose || '',
        collateral: collateral || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdVia: 'api',
        apiKeyId: context.apiKey.id,
      });

      return apiSuccess(
        {
          loan: {
            id: loan.id,
            amount: loan.amount,
            interestRate: loan.interestRate,
            term: loan.term,
            type: loan.type,
            status: loan.status,
            createdAt: loan.createdAt,
          },
          message: 'Loan created successfully',
        },
        201
      );
    } catch (error) {
      console.error('Error creating loan:', error);
      return apiError('Failed to create loan', 500);
    }
  },
  ['write:loans']
);

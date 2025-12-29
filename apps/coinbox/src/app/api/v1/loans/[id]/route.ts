// GET /api/v1/loans/:id - Get loan details
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { db } from '@/lib/firebase';

export const GET = withApiMiddleware(
  async (request: NextRequest, context: any, { params }: { params: { id: string } }) => {
    try {
      const loanDoc = await db.collection('loans').doc(params.id).get();

      if (!loanDoc.exists) {
        return apiError('Loan not found', 404);
      }

      const loanData = loanDoc.data();

      // Verify ownership
      if (loanData?.userId !== context.apiKey.userId) {
        return apiError('Forbidden', 403);
      }

      return apiSuccess({
        loan: {
          id: loanDoc.id,
          ...loanData,
        },
      });
    } catch (error) {
      console.error('Error fetching loan:', error);
      return apiError('Failed to fetch loan', 500);
    }
  },
  ['read:loans']
);

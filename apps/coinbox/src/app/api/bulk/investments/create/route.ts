/**
 * Bulk Investments API Endpoint
 * POST /api/bulk/investments/create
 * 
 * Create multiple investments in a single batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { bulkOperationsService } from '@/lib/bulk-operations-service';
import { verifyAuthentication } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthentication(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.uid;

    // Parse request body
    const body = await request.json();
    const { investments } = body;

    // Validate input
    if (!investments || !Array.isArray(investments) || investments.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: investments array is required' },
        { status: 400 }
      );
    }

    // Maximum 20 investments per batch
    if (investments.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 investments per batch allowed' },
        { status: 400 }
      );
    }

    // Validate each investment structure
    for (const investment of investments) {
      if (!investment.ticketId || !investment.amount) {
        return NextResponse.json(
          { error: 'Each investment must have ticketId and amount' },
          { status: 400 }
        );
      }
    }

    // Process bulk investments
    const result = await bulkOperationsService.createBulkInvestments(userId, investments);

    return NextResponse.json({
      success: result.success,
      batchId: result.batchId,
      totalItems: result.totalItems,
      successful: result.successful,
      failed: result.failed,
      errors: result.errors,
      results: result.results,
      processingTimeMs: result.processingTimeMs
    }, { status: result.success ? 200 : 207 }); // 207 Multi-Status for partial success

  } catch (error: any) {
    console.error('Bulk investments API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bulk investments' },
      { status: 500 }
    );
  }
}

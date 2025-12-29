/**
 * Bulk Loans API Endpoint
 * POST /api/bulk/loans/create
 * 
 * Create multiple loan tickets in a single batch
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
    const { loans } = body;

    // Validate input
    if (!loans || !Array.isArray(loans) || loans.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: loans array is required' },
        { status: 400 }
      );
    }

    // Maximum 20 loans per batch
    if (loans.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 loans per batch allowed' },
        { status: 400 }
      );
    }

    // Validate each loan structure
    for (const loan of loans) {
      if (!loan.amount || !loan.duration || !loan.interestRate) {
        return NextResponse.json(
          { error: 'Each loan must have amount, duration, and interestRate' },
          { status: 400 }
        );
      }
    }

    // Process bulk loans
    const result = await bulkOperationsService.createBulkLoans(userId, loans);

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
    console.error('Bulk loans API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bulk loans' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthentication(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId parameter is required' },
        { status: 400 }
      );
    }

    // Get bulk operation status
    const status = await bulkOperationsService.getBulkOperationStatus(batchId);

    if (!status) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error: any) {
    console.error('Get bulk loans status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bulk operation status' },
      { status: 500 }
    );
  }
}

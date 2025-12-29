/**
 * Bulk Crypto Orders API Endpoint
 * POST /api/bulk/crypto/orders
 * 
 * Create multiple crypto orders in a single batch
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
    const { orders } = body;

    // Validate input
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: orders array is required' },
        { status: 400 }
      );
    }

    // Maximum 20 orders per batch
    if (orders.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 orders per batch allowed' },
        { status: 400 }
      );
    }

    // Validate each order structure
    const validAssets = ['BTC', 'ETH', 'USDT', 'USDC'];
    const validTypes = ['BUY', 'SELL'];

    for (const order of orders) {
      if (!order.asset || !order.type || !order.amount || !order.price) {
        return NextResponse.json(
          { error: 'Each order must have asset, type, amount, and price' },
          { status: 400 }
        );
      }

      if (!validAssets.includes(order.asset)) {
        return NextResponse.json(
          { error: `Invalid asset: ${order.asset}. Must be one of: ${validAssets.join(', ')}` },
          { status: 400 }
        );
      }

      if (!validTypes.includes(order.type)) {
        return NextResponse.json(
          { error: `Invalid type: ${order.type}. Must be BUY or SELL` },
          { status: 400 }
        );
      }
    }

    // Process bulk crypto orders
    const result = await bulkOperationsService.createBulkCryptoOrders(userId, orders);

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
    console.error('Bulk crypto orders API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bulk crypto orders' },
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
    console.error('Get bulk crypto orders status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bulk operation status' },
      { status: 500 }
    );
  }
}

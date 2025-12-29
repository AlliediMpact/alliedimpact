/**
 * Bulk Messages API Endpoint
 * POST /api/bulk/messages/send
 * 
 * Send messages to multiple recipients in a single batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { bulkOperationsService } from '@/lib/bulk-operations-service';
import { verifyAuthentication } from '@/lib/auth-helpers';
import { hasAdminAccess } from '@/lib/auth-utils';

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

    // Check if user has admin/support access for bulk messaging
    const hasAccess = await hasAdminAccess(userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Bulk messaging requires admin or support role' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { recipients, subject, message, template, priority } = body;

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: recipients array is required' },
        { status: 400 }
      );
    }

    if (!subject || subject.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid request: subject is required' },
        { status: 400 }
      );
    }

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid request: message is required' },
        { status: 400 }
      );
    }

    // Maximum 50 recipients per batch
    if (recipients.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 recipients per batch allowed' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['normal', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be: normal, high, or urgent' },
        { status: 400 }
      );
    }

    // Process bulk messages
    const result = await bulkOperationsService.sendBulkMessages(userId, {
      recipients,
      subject,
      message,
      template,
      priority: priority || 'normal'
    });

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
    console.error('Bulk messages API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send bulk messages' },
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

    const userId = user.uid;

    // Check admin/support access
    const hasAccess = await hasAdminAccess(userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or support role required' },
        { status: 403 }
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
    console.error('Get bulk messages status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bulk operation status' },
      { status: 500 }
    );
  }
}

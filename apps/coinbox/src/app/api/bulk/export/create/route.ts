import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import {
  exportLoans,
  exportInvestments,
  exportTransactions,
  exportCryptoOrders,
  ExportRequest,
} from '@/lib/bulk-export-service';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { exportType, format, filters, includeFields, maxRecords } = body;

    // Validate export type
    const validTypes = ['loans', 'investments', 'transactions', 'crypto_orders'];
    if (!validTypes.includes(exportType)) {
      return NextResponse.json(
        { error: `Invalid export type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats = ['csv', 'json', 'excel'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate max records
    if (maxRecords && (maxRecords < 1 || maxRecords > 10000)) {
      return NextResponse.json(
        { error: 'Max records must be between 1 and 10,000' },
        { status: 400 }
      );
    }

    // Build export request
    const exportRequest: ExportRequest = {
      userId,
      exportType: exportType as any,
      format: format as any,
      filters: filters || {},
      includeFields,
      maxRecords: maxRecords || 10000,
    };

    // Parse date filters if provided
    if (filters?.startDate) {
      exportRequest.filters!.startDate = new Date(filters.startDate);
    }
    if (filters?.endDate) {
      exportRequest.filters!.endDate = new Date(filters.endDate);
    }

    // Execute export based on type
    let result;
    switch (exportType) {
      case 'loans':
        result = await exportLoans(exportRequest);
        break;
      case 'investments':
        result = await exportInvestments(exportRequest);
        break;
      case 'transactions':
        result = await exportTransactions(exportRequest);
        break;
      case 'crypto_orders':
        result = await exportCryptoOrders(exportRequest);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported export type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Export creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create export' },
      { status: 500 }
    );
  }
}

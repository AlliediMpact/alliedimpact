import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { getExportHistory } from '@/lib/bulk-export-service';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get export history
    const exports = await getExportHistory(userId, limit);

    return NextResponse.json(
      { exports },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Export history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch export history' },
      { status: 500 }
    );
  }
}

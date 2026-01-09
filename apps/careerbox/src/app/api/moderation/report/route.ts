import { NextRequest, NextResponse } from 'next/server';
import { reportContent } from '@/lib/moderation';

/**
 * POST /api/moderation/report
 * Report inappropriate content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentType, contentId, contentOwnerId, reportedByUid, reason } = body;

    // TODO: Verify auth

    if (!contentType || !contentId || !contentOwnerId || !reportedByUid || !reason) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const result = await reportContent(
      contentType,
      contentId,
      contentOwnerId,
      reportedByUid,
      reason
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Content reported successfully. We will review it shortly.',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to report content' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error reporting content:', error);
    return NextResponse.json(
      { error: 'Failed to report content' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * POST /api/log-error
 * Log errors from the frontend for monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, stack, digest, timestamp, userId, page } = body;

    // Save error to Firestore
    const errorsRef = collection(db, 'drivemaster_error_logs');
    await addDoc(errorsRef, {
      message,
      stack,
      digest,
      timestamp: timestamp || new Date().toISOString(),
      userId: userId || null,
      page: page || null,
      userAgent: request.headers.get('user-agent'),
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Error logged successfully',
    });
  } catch (error) {
    console.error('Error logging error:', error);
    // Don't fail the request even if logging fails
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * POST /api/enrollments
 * Create a new course enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, tier } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId' },
        { status: 400 }
      );
    }

    // Check if enrollment already exists
    const enrollmentsRef = collection(db, 'eductech_enrollments');
    const existingQuery = query(
      enrollmentsRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    // Create new enrollment
    const enrollmentData = {
      userId,
      courseId,
      tier: tier || 'free',
      enrolledAt: serverTimestamp(),
      lastAccessedAt: serverTimestamp(),
      lastAccessedLessonId: null,
      progress: 0,
      completedLessons: [],
      status: 'active',
    };

    const docRef = await addDoc(enrollmentsRef, enrollmentData);

    return NextResponse.json({
      success: true,
      enrollmentId: docRef.id,
      message: 'Enrollment created successfully',
    });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/enrollments
 * Get user's enrollment for a specific course
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, courseId' },
        { status: 400 }
      );
    }

    // Get enrollment
    const enrollmentsRef = collection(db, 'eductech_enrollments');
    const enrollmentQuery = query(
      enrollmentsRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      limit(1)
    );

    const enrollmentDocs = await getDocs(enrollmentQuery);

    if (enrollmentDocs.empty) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const enrollmentDoc = enrollmentDocs.docs[0];
    const enrollmentData = {
      id: enrollmentDoc.id,
      ...enrollmentDoc.data(),
    };

    return NextResponse.json({
      success: true,
      enrollment: enrollmentData,
      lastAccessedLessonId: enrollmentData.lastAccessedLessonId,
    });
  } catch (error) {
    console.error('Error getting enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to get enrollment' },
      { status: 500 }
    );
  }
}

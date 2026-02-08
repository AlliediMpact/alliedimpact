import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';

/**
 * POST /api/progress
 * Save lesson progress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, lessonId, progress, completedAt } = body;

    if (!userId || !courseId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId, lessonId' },
        { status: 400 }
      );
    }

    // Save progress record
    const progressRef = collection(db, 'eductech_progress');
    await addDoc(progressRef, {
      userId,
      courseId,
      lessonId,
      progress: progress || 100,
      completedAt: completedAt || new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    // Update enrollment if exists
    const enrollmentsRef = collection(db, 'eductech_enrollments');
    const enrollmentQuery = query(
      enrollmentsRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );

    const enrollmentDocs = await getDocs(enrollmentQuery);

    if (!enrollmentDocs.empty) {
      const enrollmentDoc = enrollmentDocs.docs[0];
      await updateDoc(doc(db, 'eductech_enrollments', enrollmentDoc.id), {
        lastAccessedAt: serverTimestamp(),
        lastAccessedLessonId: lessonId,
        completedLessons: arrayUnion(lessonId),
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

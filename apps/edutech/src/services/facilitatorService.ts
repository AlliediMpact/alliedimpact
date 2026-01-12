/**
 * Facilitator Service
 * 
 * Manages facilitator operations in the EduTech platform.
 * Facilitators are Allied iMpact staff who support learners in physical labs.
 * They CAN: monitor classes, view progress, mark attendance, add notes
 * They CANNOT: create courses, manage subscriptions, or modify platform content
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  FacilitatorProfile,
  Class,
  AttendanceRecord,
  PerformanceNote,
  EduTechUser,
  Enrollment,
} from '../types';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const facilitatorsRef = collection(db, 'edutech_facilitators');
const classesRef = collection(db, 'edutech_classes');
const usersRef = collection(db, 'edutech_users');
const enrollmentsRef = collection(db, 'edutech_enrollments');
const attendanceRef = collection(db, 'edutech_attendance');
const notesRef = collection(db, 'edutech_performance_notes');

// ============================================================================
// FACILITATOR PROFILE
// ============================================================================

/**
 * Get facilitator profile
 */
export async function getFacilitatorProfile(
  userId: string
): Promise<FacilitatorProfile | null> {
  try {
    const docRef = doc(facilitatorsRef, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), facilitatorId: docSnap.id } as FacilitatorProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching facilitator profile:', error);
    throw error;
  }
}

/**
 * Update facilitator stats (called by system after changes)
 */
export async function updateFacilitatorStats(
  facilitatorId: string,
  stats: Partial<FacilitatorProfile>
): Promise<void> {
  try {
    const docRef = doc(facilitatorsRef, facilitatorId);
    await updateDoc(docRef, {
      ...stats,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating facilitator stats:', error);
    throw error;
  }
}

// ============================================================================
// CLASS MANAGEMENT (Read Only for Facilitators)
// ============================================================================

/**
 * Get all classes assigned to a facilitator
 */
export async function getAssignedClasses(facilitatorId: string): Promise<Class[]> {
  try {
    const q = query(
      classesRef,
      where('facilitatorIds', 'array-contains', facilitatorId),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const classes: Class[] = [];

    querySnapshot.forEach((doc) => {
      classes.push({ ...doc.data(), classId: doc.id } as Class);
    });

    return classes;
  } catch (error) {
    console.error('Error fetching assigned classes:', error);
    throw error;
  }
}

/**
 * Get a specific class by ID
 */
export async function getClass(classId: string): Promise<Class | null> {
  try {
    const docRef = doc(classesRef, classId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), classId: docSnap.id } as Class;
    }
    return null;
  } catch (error) {
    console.error('Error fetching class:', error);
    throw error;
  }
}

// ============================================================================
// LEARNER MANAGEMENT
// ============================================================================

/**
 * Get all learners in a class
 */
export async function getClassLearners(classId: string): Promise<EduTechUser[]> {
  try {
    const classData = await getClass(classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    const learners: EduTechUser[] = [];

    // Fetch each learner
    for (const learnerId of classData.learnerIds) {
      const userRef = doc(usersRef, learnerId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        learners.push({ ...userSnap.data(), userId: userSnap.id } as EduTechUser);
      }
    }

    return learners;
  } catch (error) {
    console.error('Error fetching class learners:', error);
    throw error;
  }
}

/**
 * Get learner progress summary
 */
export async function getLearnerProgress(
  learnerId: string,
  classId?: string
): Promise<{
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalHours: number;
  enrollments: Enrollment[];
}> {
  try {
    const q = query(
      enrollmentsRef,
      where('userId', '==', learnerId),
      orderBy('enrolledAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const enrollments: Enrollment[] = [];

    querySnapshot.forEach((doc) => {
      enrollments.push({ ...doc.data(), enrollmentId: doc.id } as Enrollment);
    });

    const completed = enrollments.filter((e) => e.status === 'completed');
    const inProgress = enrollments.filter((e) => e.status === 'in-progress');
    const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
    const totalHours = enrollments.reduce((sum, e) => sum + (e.totalTimeSpent || 0), 0);

    return {
      totalEnrollments: enrollments.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      averageProgress: enrollments.length > 0 ? totalProgress / enrollments.length : 0,
      totalHours: Math.round(totalHours / 60), // convert to hours
      enrollments,
    };
  } catch (error) {
    console.error('Error fetching learner progress:', error);
    throw error;
  }
}

// ============================================================================
// ATTENDANCE MANAGEMENT
// ============================================================================

/**
 * Mark attendance for a learner
 */
export async function markAttendance(
  classId: string,
  learnerId: string,
  date: Date,
  present: boolean,
  facilitatorId: string,
  notes?: string
): Promise<string> {
  try {
    const attendanceData: Omit<AttendanceRecord, 'recordId'> = {
      classId,
      learnerId,
      date: Timestamp.fromDate(date),
      present,
      notes,
      markedBy: facilitatorId,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(attendanceRef, attendanceData);
    return docRef.id;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
}

/**
 * Get attendance records for a class
 */
export async function getClassAttendance(
  classId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AttendanceRecord[]> {
  try {
    let q = query(
      attendanceRef,
      where('classId', '==', classId),
      orderBy('date', 'desc')
    );

    if (startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);
    const records: AttendanceRecord[] = [];

    querySnapshot.forEach((doc) => {
      records.push({ ...doc.data(), recordId: doc.id } as AttendanceRecord);
    });

    return records;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
}

/**
 * Get attendance records for a specific learner
 */
export async function getLearnerAttendance(
  learnerId: string,
  classId?: string
): Promise<AttendanceRecord[]> {
  try {
    let q = query(
      attendanceRef,
      where('learnerId', '==', learnerId),
      orderBy('date', 'desc')
    );

    if (classId) {
      q = query(q, where('classId', '==', classId));
    }

    const querySnapshot = await getDocs(q);
    const records: AttendanceRecord[] = [];

    querySnapshot.forEach((doc) => {
      records.push({ ...doc.data(), recordId: doc.id } as AttendanceRecord);
    });

    return records;
  } catch (error) {
    console.error('Error fetching learner attendance:', error);
    throw error;
  }
}

// ============================================================================
// PERFORMANCE NOTES
// ============================================================================

/**
 * Add a performance note for a learner
 */
export async function submitPerformanceNote(
  classId: string,
  learnerId: string,
  facilitatorId: string,
  note: string,
  category?: 'positive' | 'concern' | 'general'
): Promise<string> {
  try {
    const noteData: Omit<PerformanceNote, 'noteId'> = {
      classId,
      learnerId,
      facilitatorId,
      note,
      category: category || 'general',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(notesRef, noteData);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting performance note:', error);
    throw error;
  }
}

/**
 * Get performance notes for a learner
 */
export async function getPerformanceNotes(
  learnerId: string,
  classId?: string
): Promise<PerformanceNote[]> {
  try {
    let q = query(
      notesRef,
      where('learnerId', '==', learnerId),
      orderBy('createdAt', 'desc')
    );

    if (classId) {
      q = query(q, where('classId', '==', classId));
    }

    const querySnapshot = await getDocs(q);
    const notes: PerformanceNote[] = [];

    querySnapshot.forEach((doc) => {
      notes.push({ ...doc.data(), noteId: doc.id } as PerformanceNote);
    });

    return notes;
  } catch (error) {
    console.error('Error fetching performance notes:', error);
    throw error;
  }
}

// ============================================================================
// ANALYTICS & STATS
// ============================================================================

/**
 * Get facilitator dashboard statistics
 */
export async function getFacilitatorStats(facilitatorId: string): Promise<{
  totalClasses: number;
  totalLearners: number;
  activeLearnersThisWeek: number;
  averageAttendanceRate: number;
  averageProgress: number;
}> {
  try {
    // Get assigned classes
    const classes = await getAssignedClasses(facilitatorId);
    const totalClasses = classes.length;

    // Count total learners across all classes
    const learnerIds = new Set<string>();
    classes.forEach((classData) => {
      classData.learnerIds.forEach((id) => learnerIds.add(id));
    });
    const totalLearners = learnerIds.size;

    // Calculate active learners this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let activeLearners = 0;
    for (const classId of classes.map((c) => c.classId)) {
      const attendance = await getClassAttendance(classId, oneWeekAgo);
      const uniqueLearners = new Set(attendance.map((a) => a.learnerId));
      activeLearners += uniqueLearners.size;
    }

    // Calculate average attendance rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalAttendanceRecords = 0;
    let presentRecords = 0;

    for (const classId of classes.map((c) => c.classId)) {
      const attendance = await getClassAttendance(classId, thirtyDaysAgo);
      totalAttendanceRecords += attendance.length;
      presentRecords += attendance.filter((a) => a.present).length;
    }

    const averageAttendanceRate =
      totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0;

    // Calculate average progress
    let totalProgress = 0;
    let learnerCount = 0;

    for (const learnerId of Array.from(learnerIds)) {
      const progress = await getLearnerProgress(learnerId);
      totalProgress += progress.averageProgress;
      learnerCount++;
    }

    const averageProgress = learnerCount > 0 ? totalProgress / learnerCount : 0;

    return {
      totalClasses,
      totalLearners,
      activeLearnersThisWeek: activeLearners,
      averageAttendanceRate: Math.round(averageAttendanceRate),
      averageProgress: Math.round(averageProgress),
    };
  } catch (error) {
    console.error('Error calculating facilitator stats:', error);
    throw error;
  }
}

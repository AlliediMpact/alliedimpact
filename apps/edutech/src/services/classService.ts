/**
 * Class Service
 * 
 * Manages class operations for EduTech platform.
 * Classes are physical learning groups at schools managed by System Admins.
 * Facilitators are assigned to classes to support learners.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Class, CourseTrack } from '../types';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const classesRef = collection(db, 'edutech_classes');
const usersRef = collection(db, 'edutech_users');

// ============================================================================
// CLASS CRUD OPERATIONS
// ============================================================================

/**
 * Create a new class
 */
export async function createClass(classData: {
  name: string;
  schoolName: string;
  track: CourseTrack;
  grade?: string;
  scheduleNotes?: string;
}): Promise<string> {
  try {
    const newClass: Omit<Class, 'classId'> = {
      ...classData,
      facilitatorIds: [],
      learnerIds: [],
      totalLearners: 0,
      activeLearnersThisWeek: 0,
      averageProgress: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(classesRef, newClass);
    return docRef.id;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
}

/**
 * Update class details
 */
export async function updateClass(
  classId: string,
  updates: Partial<Class>
): Promise<void> {
  try {
    const docRef = doc(classesRef, classId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
}

/**
 * Delete a class
 */
export async function deleteClass(classId: string): Promise<void> {
  try {
    // Remove class from all facilitators and learners
    const classData = await getClass(classId);
    if (classData) {
      // Remove from facilitators
      for (const facilitatorId of classData.facilitatorIds) {
        const userRef = doc(usersRef, facilitatorId);
        await updateDoc(userRef, {
          assignedClassIds: arrayRemove(classId),
        });
      }

      // Remove from learners (if tracked in user profile)
      for (const learnerId of classData.learnerIds) {
        const userRef = doc(usersRef, learnerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.assignedClassIds) {
            await updateDoc(userRef, {
              assignedClassIds: arrayRemove(classId),
            });
          }
        }
      }
    }

    // Delete the class
    const docRef = doc(classesRef, classId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
}

/**
 * Get a class by ID
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

/**
 * Get all classes
 */
export async function getAllClasses(track?: CourseTrack): Promise<Class[]> {
  try {
    let q = query(classesRef, orderBy('name', 'asc'));

    if (track) {
      q = query(classesRef, where('track', '==', track), orderBy('name', 'asc'));
    }

    const querySnapshot = await getDocs(q);
    const classes: Class[] = [];

    querySnapshot.forEach((doc) => {
      classes.push({ ...doc.data(), classId: doc.id } as Class);
    });

    return classes;
  } catch (error) {
    console.error('Error fetching all classes:', error);
    throw error;
  }
}

/**
 * Get classes by school
 */
export async function getClassesBySchool(schoolName: string): Promise<Class[]> {
  try {
    const q = query(
      classesRef,
      where('schoolName', '==', schoolName),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const classes: Class[] = [];

    querySnapshot.forEach((doc) => {
      classes.push({ ...doc.data(), classId: doc.id } as Class);
    });

    return classes;
  } catch (error) {
    console.error('Error fetching classes by school:', error);
    throw error;
  }
}

// ============================================================================
// FACILITATOR ASSIGNMENT
// ============================================================================

/**
 * Assign a facilitator to a class
 */
export async function assignFacilitator(
  classId: string,
  facilitatorId: string
): Promise<void> {
  try {
    // Add facilitator to class
    const classRef = doc(classesRef, classId);
    await updateDoc(classRef, {
      facilitatorIds: arrayUnion(facilitatorId),
      updatedAt: Timestamp.now(),
    });

    // Add class to facilitator's assigned classes
    const userRef = doc(usersRef, facilitatorId);
    await updateDoc(userRef, {
      assignedClassIds: arrayUnion(classId),
    });
  } catch (error) {
    console.error('Error assigning facilitator:', error);
    throw error;
  }
}

/**
 * Remove a facilitator from a class
 */
export async function removeFacilitator(
  classId: string,
  facilitatorId: string
): Promise<void> {
  try {
    // Remove facilitator from class
    const classRef = doc(classesRef, classId);
    await updateDoc(classRef, {
      facilitatorIds: arrayRemove(facilitatorId),
      updatedAt: Timestamp.now(),
    });

    // Remove class from facilitator's assigned classes
    const userRef = doc(usersRef, facilitatorId);
    await updateDoc(userRef, {
      assignedClassIds: arrayRemove(classId),
    });
  } catch (error) {
    console.error('Error removing facilitator:', error);
    throw error;
  }
}

// ============================================================================
// LEARNER MANAGEMENT
// ============================================================================

/**
 * Add a learner to a class
 */
export async function addLearnerToClass(
  classId: string,
  learnerId: string
): Promise<void> {
  try {
    const classRef = doc(classesRef, classId);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      throw new Error('Class not found');
    }

    const classData = { ...classSnap.data(), classId: classSnap.id } as Class;

    // Add learner to class
    await updateDoc(classRef, {
      learnerIds: arrayUnion(learnerId),
      totalLearners: classData.learnerIds.length + 1,
      updatedAt: Timestamp.now(),
    });

    // Optionally add class to learner profile
    const userRef = doc(usersRef, learnerId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        assignedClassIds: arrayUnion(classId),
      });
    }
  } catch (error) {
    console.error('Error adding learner to class:', error);
    throw error;
  }
}

/**
 * Remove a learner from a class
 */
export async function removeLearnerFromClass(
  classId: string,
  learnerId: string
): Promise<void> {
  try {
    const classRef = doc(classesRef, classId);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      throw new Error('Class not found');
    }

    const classData = { ...classSnap.data(), classId: classSnap.id } as Class;

    // Remove learner from class
    await updateDoc(classRef, {
      learnerIds: arrayRemove(learnerId),
      totalLearners: Math.max(0, classData.learnerIds.length - 1),
      updatedAt: Timestamp.now(),
    });

    // Remove class from learner profile
    const userRef = doc(usersRef, learnerId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.assignedClassIds) {
        await updateDoc(userRef, {
          assignedClassIds: arrayRemove(classId),
        });
      }
    }
  } catch (error) {
    console.error('Error removing learner from class:', error);
    throw error;
  }
}

/**
 * Add multiple learners to a class (bulk operation)
 */
export async function addLearnersToClass(
  classId: string,
  learnerIds: string[]
): Promise<void> {
  try {
    for (const learnerId of learnerIds) {
      await addLearnerToClass(classId, learnerId);
    }
  } catch (error) {
    console.error('Error adding learners to class:', error);
    throw error;
  }
}

// ============================================================================
// CLASS ANALYTICS & STATS
// ============================================================================

/**
 * Update class statistics
 */
export async function updateClassStats(classId: string): Promise<void> {
  try {
    const classData = await getClass(classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    // Calculate stats (this would normally be done with actual enrollment data)
    // For now, we'll use placeholder logic
    const totalLearners = classData.learnerIds.length;

    // You'd fetch actual enrollment data to calculate these
    const activeLearnersThisWeek = 0; // Placeholder
    const averageProgress = 0; // Placeholder

    const classRef = doc(classesRef, classId);
    await updateDoc(classRef, {
      totalLearners,
      activeLearnersThisWeek,
      averageProgress,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating class stats:', error);
    throw error;
  }
}

/**
 * Get admin dashboard stats
 */
export async function getAdminClassStats(): Promise<{
  totalClasses: number;
  totalLearners: number;
  totalFacilitators: number;
  classesByTrack: Record<string, number>;
}> {
  try {
    const classes = await getAllClasses();
    const totalClasses = classes.length;

    // Count unique learners across all classes
    const uniqueLearners = new Set<string>();
    classes.forEach((classData) => {
      classData.learnerIds.forEach((id) => uniqueLearners.add(id));
    });

    // Count unique facilitators across all classes
    const uniqueFacilitators = new Set<string>();
    classes.forEach((classData) => {
      classData.facilitatorIds.forEach((id) => uniqueFacilitators.add(id));
    });

    // Count classes by track
    const classesByTrack: Record<string, number> = {};
    classes.forEach((classData) => {
      const track = classData.track;
      classesByTrack[track] = (classesByTrack[track] || 0) + 1;
    });

    return {
      totalClasses,
      totalLearners: uniqueLearners.size,
      totalFacilitators: uniqueFacilitators.size,
      classesByTrack,
    };
  } catch (error) {
    console.error('Error calculating admin class stats:', error);
    throw error;
  }
}

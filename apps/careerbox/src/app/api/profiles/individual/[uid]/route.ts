import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { findMatchesForIndividual } from '@/lib/matching-engine';
import type { IndividualProfile } from '@/types';

/**
 * GET /api/profiles/individual/[uid]
 * Get individual profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    // TODO: Verify auth and ownership
    // const authUser = await verifyAuth(request);
    // if (!authUser || authUser.uid !== uid) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Get profile from Firestore
    // const profileDoc = await getDoc(doc(db, 'careerbox_individuals', uid));

    return NextResponse.json({ 
      success: true,
      profile: {
        uid,
        // Mock data for now
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profiles/individual/[uid]
 * Update individual profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const body = await request.json();

    // TODO: Verify auth and ownership
    // TODO: Validate profile data
    // TODO: Update Firestore document
    // TODO: Trigger matching if profile is complete

    // If profile is now complete, trigger matching
    if (body.profileComplete) {
      await findMatchesForIndividual(uid);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { CompanyProfile } from '@/types';

/**
 * GET /api/profiles/company/[uid]
 * Get company profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    // Get profile from Firestore
    const profileDoc = await getDoc(doc(db, 'careerbox_companies', uid));

    if (!profileDoc.exists()) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      profile: {
        uid,
        ...profileDoc.data(),
      }
    });
  } catch (error) {
    console.error('Error getting company profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profiles/company/[uid]
 * Create or update company profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    const body = await request.json();

    const profileRef = doc(db, 'careerbox_companies', uid);
    const { uid: _uid, ...profileData } = body; // Remove uid from data
    
    // Check if profile exists
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      // Update existing profile
      const { createdAt, ...updateData } = profileData; // Remove createdAt from update
      await updateDoc(profileRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new profile
      await setDoc(profileRef, {
        uid,
        ...profileData,
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ 
      success: true,
      message: profileDoc.exists() ? 'Company profile updated successfully' : 'Company profile created successfully'
    });
  } catch (error) {
    console.error('Error saving company profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

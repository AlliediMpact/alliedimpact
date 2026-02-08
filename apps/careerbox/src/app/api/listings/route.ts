import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { findMatchesForListing } from '@/lib/matching-engine';

/**
 * POST /api/listings
 * Create a new position listing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Verify auth
    // TODO: Validate listing data
    // TODO: Check subscription tier limits

    const listingData = {
      ...body,
      isActive: true,
      isPaused: false,
      viewCount: 0,
      matchCount: 0,
      applicationCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    // Create listing
    const docRef = await addDoc(collection(db, 'careerbox_listings'), listingData);

    // Trigger matching for this listing
    await findMatchesForListing(docRef.id);

    return NextResponse.json({
      success: true,
      listingId: docRef.id,
      message: 'Listing created successfully',
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings
 * Get all listings (with filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyUid = searchParams.get('companyUid');

    const listingsRef = collection(db, 'careerbox_listings');
    let listingsQuery;

    if (companyUid) {
      // Get listings for a specific company
      listingsQuery = query(
        listingsRef,
        where('companyUid', '==', companyUid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all active listings
      listingsQuery = query(
        listingsRef,
        where('isActive', '==', true),
        where('isPaused', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const listingsSnap = await getDocs(listingsQuery);
    const listings = listingsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error('Error getting listings:', error);
    return NextResponse.json(
      { error: 'Failed to get listings' },
      { status: 500 }
    );
  }
}

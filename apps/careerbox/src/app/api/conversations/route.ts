import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * GET /api/conversations
 * Get all conversations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const userType = searchParams.get('userType') as 'individual' | 'company';

    if (!uid || !userType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // TODO: Verify auth

    // Get conversations
    const conversationsRef = collection(db, 'careerbox_conversations');
    const conversationsQuery = query(
      conversationsRef,
      where(`${userType}Uid`, '==', uid),
      where('isActive', '==', true),
      orderBy('lastMessageAt', 'desc')
    );

    const conversationsSnap = await getDocs(conversationsQuery);
    const conversations = conversationsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

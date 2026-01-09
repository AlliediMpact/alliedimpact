import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import type { Message, Conversation } from '@/types';

/**
 * POST /api/messages
 * Send a new message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderUid, recipientUid, content, matchId } = body;

    // TODO: Verify auth
    // TODO: Check subscription tier (messaging enabled?)
    // TODO: Check monthly message limit for Entry tier

    // Create conversation if it doesn't exist
    const conversationsRef = collection(db, 'careerbox_conversations');
    const conversationQuery = query(conversationsRef, where('id', '==', conversationId));
    const conversationSnap = await getDocs(conversationQuery);

    if (conversationSnap.empty) {
      // Create new conversation
      await addDoc(conversationsRef, {
        id: conversationId,
        individualUid: body.individualUid,
        individualName: body.individualName,
        companyUid: body.companyUid,
        companyName: body.companyName,
        listingId: body.listingId,
        listingTitle: body.listingTitle,
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: senderUid,
        unreadByIndividual: body.senderType === 'company' ? 1 : 0,
        unreadByCompany: body.senderType === 'individual' ? 1 : 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update existing conversation
      const conversationDoc = conversationSnap.docs[0];
      await updateDoc(doc(db, 'careerbox_conversations', conversationDoc.id), {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastMessageBy: senderUid,
        [`unreadBy${body.recipientType === 'individual' ? 'Individual' : 'Company'}`]: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    // Create message
    const messageData: Partial<Message> = {
      conversationId,
      matchId,
      senderUid,
      senderName: body.senderName,
      senderType: body.senderType,
      recipientUid,
      recipientName: body.recipientName,
      recipientType: body.recipientType,
      content,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'careerbox_messages'), messageData);

    // TODO: Send notification to recipient
    // TODO: Increment monthly message count for sender

    return NextResponse.json({
      success: true,
      messageId: docRef.id,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages
 * Get messages for a conversation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const uid = searchParams.get('uid');

    if (!conversationId || !uid) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // TODO: Verify auth and access

    // Get messages
    const messagesRef = collection(db, 'careerbox_messages');
    const messagesQuery = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const messagesSnap = await getDocs(messagesQuery);
    const messages = messagesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Mark messages as read
    const unreadMessages = messages.filter(
      (msg: any) => !msg.isRead && msg.recipientUid === uid
    );

    for (const msg of unreadMessages) {
      await updateDoc(doc(db, 'careerbox_messages', msg.id), {
        isRead: true,
        readAt: serverTimestamp(),
      });
    }

    // Update conversation unread count
    if (unreadMessages.length > 0) {
      const conversationsRef = collection(db, 'careerbox_conversations');
      const conversationQuery = query(conversationsRef, where('id', '==', conversationId));
      const conversationSnap = await getDocs(conversationQuery);
      
      if (!conversationSnap.empty) {
        const conversationDoc = conversationSnap.docs[0];
        const userType = messages[0].recipientType; // Determine user type from message
        await updateDoc(doc(db, 'careerbox_conversations', conversationDoc.id), {
          [`unreadBy${userType === 'individual' ? 'Individual' : 'Company'}`]: 0,
        });
      }
    }

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

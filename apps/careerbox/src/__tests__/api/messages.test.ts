import { POST } from '@/app/api/messages/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  increment: jest.fn((val) => val),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('POST /api/messages', () => {
  const mockMessageData = {
    conversationId: 'conv123',
    senderUid: 'user123',
    senderName: 'John Doe',
    senderType: 'individual',
    recipientUid: 'company456',
    recipientName: 'Tech Corp',
    recipientType: 'company',
    content: 'Hello, I am interested in this position',
    matchId: 'match789',
    individualUid: 'user123',
    individualName: 'John Doe',
    companyUid: 'company456',
    companyName: 'Tech Corp',
    listingId: 'listing123',
    listingTitle: 'Software Engineer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new conversation and send message', async () => {
    const mockEmptySnapshot = { empty: true, docs: [] };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockEmptySnapshot);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.messageId).toBe('message123');
    expect(data.message).toBe('Message sent successfully');
    expect(addDoc).toHaveBeenCalledTimes(2); // Once for conversation, once for message
  });

  it('should create conversation with correct fields', async () => {
    const mockEmptySnapshot = { empty: true, docs: [] };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockEmptySnapshot);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    await POST(request);

    const conversationCall = (addDoc as jest.Mock).mock.calls[0];
    expect(conversationCall[1]).toMatchObject({
      id: 'conv123',
      individualUid: 'user123',
      individualName: 'John Doe',
      companyUid: 'company456',
      companyName: 'Tech Corp',
      listingId: 'listing123',
      listingTitle: 'Software Engineer',
      lastMessage: 'Hello, I am interested in this position',
      lastMessageBy: 'user123',
      isActive: true,
    });
  });

  it('should set correct unread count for new conversation (sender is individual)', async () => {
    const mockEmptySnapshot = { empty: true, docs: [] };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockEmptySnapshot);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    await POST(request);

    const conversationCall = (addDoc as jest.Mock).mock.calls[0];
    expect(conversationCall[1].unreadByIndividual).toBe(0);
    expect(conversationCall[1].unreadByCompany).toBe(1);
  });

  it('should set correct unread count for new conversation (sender is company)', async () => {
    const companyMessageData = {
      ...mockMessageData,
      senderUid: 'company456',
      senderType: 'company',
      recipientUid: 'user123',
      recipientType: 'individual',
    };

    const mockEmptySnapshot = { empty: true, docs: [] };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockEmptySnapshot);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(companyMessageData),
    });

    await POST(request);

    const conversationCall = (addDoc as jest.Mock).mock.calls[0];
    expect(conversationCall[1].unreadByIndividual).toBe(1);
    expect(conversationCall[1].unreadByCompany).toBe(0);
  });

  it('should update existing conversation when it already exists', async () => {
    const mockExistingConversation = {
      docs: [{ id: 'existingConv1', data: () => ({ id: 'conv123' }) }],
    };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockExistingConversation);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(updateDoc).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledTimes(1); // Only for message, not conversation
  });

  it('should increment unread count for recipient in existing conversation', async () => {
    const mockExistingConversation = {
      docs: [{ id: 'existingConv1', data: () => ({ id: 'conv123' }) }],
    };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockExistingConversation);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    await POST(request);

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        lastMessage: 'Hello, I am interested in this position',
        lastMessageBy: 'user123',
        unreadByCompany: 1,
      })
    );
  });

  it('should create message with correct fields', async () => {
    const mockEmptySnapshot = { empty: true, docs: [] };
    const mockDocRef = { id: 'message123' };
    (getDocs as jest.Mock).mockResolvedValue(mockEmptySnapshot);
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    await POST(request);

    const messageCall = (addDoc as jest.Mock).mock.calls[1];
    expect(messageCall[1]).toMatchObject({
      conversationId: 'conv123',
      matchId: 'match789',
      senderUid: 'user123',
      senderName: 'John Doe',
      senderType: 'individual',
      recipientUid: 'company456',
      recipientName: 'Tech Corp',
      recipientType: 'company',
      content: 'Hello, I am interested in this position',
      isRead: false,
      readAt: null,
    });
  });

  it('should handle errors gracefully', async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to send message');
  });

  it('should handle conversation creation error', async () => {
    const mockEmptySnapshot = { empty: true, docs: [] };
    (getDocs as jest.Mock).mockResolvedValue(mockEmptySnapshot);
    (addDoc as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/messages', {
      method: 'POST',
      body: JSON.stringify(mockMessageData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to send message');
  });
});

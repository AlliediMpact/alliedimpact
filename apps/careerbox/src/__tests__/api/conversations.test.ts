import { GET } from '@/app/api/conversations/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('GET /api/conversations', () => {
  const mockConversations = [
    {
      id: 'conv1',
      individualUid: 'user123',
      companyUid: 'company456',
      lastMessage: 'Hello',
      lastMessageAt: new Date('2026-02-08T10:00:00'),
      isActive: true,
    },
    {
      id: 'conv2',
      individualUid: 'user123',
      companyUid: 'company789',
      lastMessage: 'Thanks',
      lastMessageAt: new Date('2026-02-07T15:30:00'),
      isActive: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Parameter Validation', () => {
    it('should return 400 if uid is missing', async () => {
      const request = new NextRequest('http://localhost/api/conversations?userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 if userType is missing', async () => {
      const request = new NextRequest('http://localhost/api/conversations?uid=user123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 if both parameters are missing', async () => {
      const request = new NextRequest('http://localhost/api/conversations');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });
  });

  describe('Individual Conversations', () => {
    it('should get conversations for individual user', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.conversations).toHaveLength(2);
      expect(where).toHaveBeenCalledWith('individualUid', '==', 'user123');
      expect(where).toHaveBeenCalledWith('isActive', '==', true);
      expect(orderBy).toHaveBeenCalledWith('lastMessageAt', 'desc');
    });

    it('should include conversation IDs in response', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(data.conversations[0].id).toBe('conv1');
      expect(data.conversations[1].id).toBe('conv2');
    });
  });

  describe('Company Conversations', () => {
    it('should get conversations for company user', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=company456&userType=company');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(where).toHaveBeenCalledWith('companyUid', '==', 'company456');
      expect(where).toHaveBeenCalledWith('isActive', '==', true);
    });

    it('should use correct field name for company queries', async () => {
      const mockSnapshot = {
        docs: [],
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=company456&userType=company');

      await GET(request);

      expect(where).toHaveBeenCalledWith('companyUid', '==', 'company456');
    });
  });

  describe('Filtering and Sorting', () => {
    it('should only return active conversations', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      await GET(request);

      expect(where).toHaveBeenCalledWith('isActive', '==', true);
    });

    it('should order conversations by last message date descending', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      await GET(request);

      expect(orderBy).toHaveBeenCalledWith('lastMessageAt', 'desc');
    });
  });

  describe('Empty Results', () => {
    it('should return empty array when no conversations found', async () => {
      const mockSnapshot = {
        docs: [],
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.conversations).toHaveLength(0);
    });

    it('should handle new user with no conversations', async () => {
      const mockSnapshot = {
        docs: [],
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=newuser456&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversations).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get conversations');
    });

    it('should handle query construction errors', async () => {
      (query as jest.Mock).mockImplementation(() => {
        throw new Error('Query error');
      });

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get conversations');
    });

    it('should handle getDocs errors', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get conversations');
    });
  });

  describe('Response Structure', () => {
    it('should return conversations with all fields', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(data.conversations[0]).toMatchObject({
        id: 'conv1',
        individualUid: 'user123',
        companyUid: 'company456',
        lastMessage: 'Hello',
        isActive: true,
      });
    });

    it('should maintain data integrity in response', async () => {
      const mockSnapshot = {
        docs: mockConversations.map(conv => ({
          id: conv.id,
          data: () => ({ ...conv }),
        })),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const request = new NextRequest('http://localhost/api/conversations?uid=user123&userType=individual');

      const response = await GET(request);
      const data = await response.json();

      const conversation = data.conversations[0];
      expect(conversation).toHaveProperty('id');
      expect(conversation).toHaveProperty('individualUid');
      expect(conversation).toHaveProperty('companyUid');
      expect(conversation).toHaveProperty('lastMessage');
      expect(conversation).toHaveProperty('isActive');
    });
  });
});

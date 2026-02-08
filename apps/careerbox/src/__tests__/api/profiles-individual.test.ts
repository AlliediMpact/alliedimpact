import { GET, PUT } from '@/app/api/profiles/individual/[uid]/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { getDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { findMatchesForIndividual } from '@/lib/matching-engine';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

// Mock matching engine
jest.mock('@/lib/matching-engine', () => ({
  findMatchesForIndividual: jest.fn(),
}));

describe('GET /api/profiles/individual/[uid]', () => {
  const mockProfile = {
    uid: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    skills: ['React', 'TypeScript'],
    experience: 3,
    profileComplete: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get individual profile successfully', async () => {
    const mockDoc = {
      exists: () => true,
      data: () => mockProfile,
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDoc);

    const request = new NextRequest('http://localhost/api/profiles/individual/user123');
    const response = await GET(request, { params: { uid: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.profile).toMatchObject({
      uid: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
  });

  it('should include uid in response even if not in Firestore data', async () => {
    const profileWithoutUid = { ...mockProfile };
    delete (profileWithoutUid as any).uid;
    
    const mockDoc = {
      exists: () => true,
      data: () => profileWithoutUid,
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDoc);

    const request = new NextRequest('http://localhost/api/profiles/individual/user123');
    const response = await GET(request, { params: { uid: 'user123' } });
    const data = await response.json();

    expect(data.profile.uid).toBe('user123');
  });

  it('should return 404 if profile not found', async () => {
    const mockDoc = {
      exists: () => false,
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDoc);

    const request = new NextRequest('http://localhost/api/profiles/individual/nonexistent');
    const response = await GET(request, { params: { uid: 'nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Profile not found');
  });

  it('should handle Firestore errors', async () => {
    (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const request = new NextRequest('http://localhost/api/profiles/individual/user123');
    const response = await GET(request, { params: { uid: 'user123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get profile');
  });
});

describe('PUT /api/profiles/individual/[uid]', () => {
  const mockProfileData = {
    uid: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    skills: ['React', 'TypeScript'],
    experience: 3,
    profileComplete: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Updates', () => {
    it('should update existing profile', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => mockProfileData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'user123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Profile updated successfully');
      expect(updateDoc).toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should not include createdAt in update', async () => {
      const profileWithCreatedAt = {
        ...mockProfileData,
        createdAt: new Date('2026-01-01'),
      };

      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(profileWithCreatedAt),
      });

      await PUT(request, { params: { uid: 'user123' } });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('createdAt');
      expect(updateCall).toHaveProperty('updatedAt');
    });

    it('should set updatedAt timestamp on update', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'user123' } });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.updatedAt).toBeDefined();
    });

    it('should not include uid in update data', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'user123' } });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('uid');
    });
  });

  describe('Profile Creation', () => {
    it('should create new profile if it does not exist', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'user123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Profile created successfully');
      expect(setDoc).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should set profileComplete to false for new profiles', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'user123' } });

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.profileComplete).toBe(false);
    });

    it('should include uid in new profile data', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'user123' } });

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.uid).toBe('user123');
    });

    it('should set timestamps for new profile', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'user123' } });

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.createdAt).toBeDefined();
      expect(setDocCall.updatedAt).toBeDefined();
    });
  });

  describe('Matching Trigger', () => {
    it('should trigger matching when profile is complete', async () => {
      const completeProfile = {
        ...mockProfileData,
        profileComplete: true,
      };

      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (findMatchesForIndividual as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(completeProfile),
      });

      await PUT(request, { params: { uid: 'user123' } });

      expect(findMatchesForIndividual).toHaveBeenCalledWith('user123');
    });

    it('should not trigger matching when profile is incomplete', async () => {
      const incompleteProfile = {
        ...mockProfileData,
        profileComplete: false,
      };

      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (findMatchesForIndividual as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(incompleteProfile),
      });

      await PUT(request, { params: { uid: 'user123' } });

      expect(findMatchesForIndividual).not.toHaveBeenCalled();
    });

    it('should not trigger matching when profileComplete is not set', async () => {
      const profileWithoutComplete = { ...mockProfileData };
      delete (profileWithoutComplete as any).profileComplete;

      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(profileWithoutComplete),
      });

      await PUT(request, { params: { uid: 'user123' } });

      expect(findMatchesForIndividual).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during profile update', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'user123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save profile');
    });

    it('should handle errors during profile creation', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'user123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save profile');
    });

    it('should handle errors during matching trigger', async () => {
      const completeProfile = {
        ...mockProfileData,
        profileComplete: true,
      };

      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (findMatchesForIndividual as jest.Mock).mockRejectedValue(new Error('Matching error'));

      const request = new NextRequest('http://localhost/api/profiles/individual/user123', {
        method: 'PUT',
        body: JSON.stringify(completeProfile),
      });

      const response = await PUT(request, { params: { uid: 'user123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save profile');
    });
  });
});

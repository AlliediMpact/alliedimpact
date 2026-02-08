import { GET, PUT } from '@/app/api/profiles/company/[uid]/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { getDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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

describe('GET /api/profiles/company/[uid]', () => {
  const mockProfile = {
    uid: 'company123',
    companyName: 'Tech Corp',
    email: 'hr@techcorp.com',
    industry: 'Technology',
    size: '50-200',
    location: 'Cape Town',
    profileComplete: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get company profile successfully', async () => {
    const mockDoc = {
      exists: () => true,
      data: () => mockProfile,
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDoc);

    const request = new NextRequest('http://localhost/api/profiles/company/company123');
    const response = await GET(request, { params: { uid: 'company123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.profile).toMatchObject({
      uid: 'company123',
      companyName: 'Tech Corp',
      email: 'hr@techcorp.com',
      industry: 'Technology',
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

    const request = new NextRequest('http://localhost/api/profiles/company/company123');
    const response = await GET(request, { params: { uid: 'company123' } });
    const data = await response.json();

    expect(data.profile.uid).toBe('company123');
  });

  it('should return 404 if profile not found', async () => {
    const mockDoc = {
      exists: () => false,
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDoc);

    const request = new NextRequest('http://localhost/api/profiles/company/nonexistent');
    const response = await GET(request, { params: { uid: 'nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Profile not found');
  });

  it('should handle Firestore errors', async () => {
    (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const request = new NextRequest('http://localhost/api/profiles/company/company123');
    const response = await GET(request, { params: { uid: 'company123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get profile');
  });

  it('should query correct Firestore collection', async () => {
    const mockDoc = {
      exists: () => true,
      data: () => mockProfile,
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDoc);

    const request = new NextRequest('http://localhost/api/profiles/company/company123');
    await GET(request, { params: { uid: 'company123' } });

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'careerbox_companies', 'company123');
  });
});

describe('PUT /api/profiles/company/[uid]', () => {
  const mockProfileData = {
    uid: 'company123',
    companyName: 'Tech Corp',
    email: 'hr@techcorp.com',
    industry: 'Technology',
    size: '50-200',
    location: 'Cape Town',
    description: 'Leading tech company',
    profileComplete: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Updates', () => {
    it('should update existing company profile', async () => {
      const mockDoc = {
        exists: () => true,
        data: () => mockProfileData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'company123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Company profile updated successfully');
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

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(profileWithCreatedAt),
      });

      await PUT(request, { params: { uid: 'company123' } });

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

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.updatedAt).toBeDefined();
    });

    it('should not include uid in update data', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall).not.toHaveProperty('uid');
    });
  });

  describe('Profile Creation', () => {
    it('should create new company profile if it does not exist', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'company123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Company profile created successfully');
      expect(setDoc).toHaveBeenCalled();
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should set profileComplete to false for new profiles', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.profileComplete).toBe(false);
    });

    it('should include uid in new profile data', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.uid).toBe('company123');
    });

    it('should set timestamps for new profile', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.createdAt).toBeDefined();
      expect(setDocCall.updatedAt).toBeDefined();
    });

    it('should query correct Firestore collection', async () => {
      const mockDoc = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'careerbox_companies', 'company123');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during profile update', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'company123' } });
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

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'company123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save profile');
    });

    it('should handle getDoc errors', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      const response = await PUT(request, { params: { uid: 'company123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save profile');
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all profile fields during update', async () => {
      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(mockProfileData),
      });

      await PUT(request, { params: { uid: 'company123' } });

      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall).toHaveProperty('companyName');
      expect(updateCall).toHaveProperty('email');
      expect(updateCall).toHaveProperty('industry');
      expect(updateCall).toHaveProperty('size');
      expect(updateCall).toHaveProperty('location');
      expect(updateCall).toHaveProperty('description');
    });

    it('should handle partial profile updates', async () => {
      const partialUpdate = {
        companyName: 'Updated Corp',
        location: 'Johannesburg',
      };

      const mockDoc = {
        exists: () => true,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/profiles/company/company123', {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
      });

      const response = await PUT(request, { params: { uid: 'company123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

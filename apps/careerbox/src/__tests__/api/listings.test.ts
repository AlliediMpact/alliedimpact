import { POST, GET } from '@/app/api/listings/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { findMatchesForListing } from '@/lib/matching-engine';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

// Mock matching engine
jest.mock('@/lib/matching-engine', () => ({
  findMatchesForListing: jest.fn(),
}));

describe('POST /api/listings', () => {
  const mockListingData = {
    title: 'Software Engineer',
    companyUid: 'company123',
    companyName: 'Tech Corp',
    location: 'Cape Town',
    salaryMin: 50000,
    salaryMax: 80000,
    description: 'Great opportunity',
    requirements: ['React', 'TypeScript'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new listing successfully', async () => {
    const mockDocRef = { id: 'listing123' };
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (findMatchesForListing as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify(mockListingData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.listingId).toBe('listing123');
    expect(data.message).toBe('Listing created successfully');
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...mockListingData,
        isActive: true,
        isPaused: false,
        viewCount: 0,
        matchCount: 0,
        applicationCount: 0,
      })
    );
  });

  it('should set default values for new listing', async () => {
    const mockDocRef = { id: 'listing123' };
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (findMatchesForListing as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify(mockListingData),
    });

    await POST(request);

    const callArgs = (addDoc as jest.Mock).mock.calls[0][1];
    expect(callArgs.isActive).toBe(true);
    expect(callArgs.isPaused).toBe(false);
    expect(callArgs.viewCount).toBe(0);
    expect(callArgs.matchCount).toBe(0);
    expect(callArgs.applicationCount).toBe(0);
    expect(callArgs.createdAt).toBeDefined();
    expect(callArgs.updatedAt).toBeDefined();
    expect(callArgs.expiresAt).toBeDefined();
  });

  it('should trigger matching after creating listing', async () => {
    const mockDocRef = { id: 'listing123' };
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (findMatchesForListing as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify(mockListingData),
    });

    await POST(request);

    expect(findMatchesForListing).toHaveBeenCalledWith('listing123');
  });

  it('should set expiry date to 90 days from creation', async () => {
    const mockDocRef = { id: 'listing123' };
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (findMatchesForListing as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify(mockListingData),
    });

    await POST(request);

    const callArgs = (addDoc as jest.Mock).mock.calls[0][1];
    const expiresAt = new Date(callArgs.expiresAt);
    const createdAt = new Date();
    const diffDays = Math.floor((expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(89);
    expect(diffDays).toBeLessThanOrEqual(90);
  });

  it('should handle errors during listing creation', async () => {
    (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const request = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify(mockListingData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create listing');
  });

  it('should handle errors during matching trigger', async () => {
    const mockDocRef = { id: 'listing123' };
    (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
    (findMatchesForListing as jest.Mock).mockRejectedValue(new Error('Matching error'));

    const request = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify(mockListingData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create listing');
  });
});

describe('GET /api/listings', () => {
  const mockListings = [
    {
      id: 'listing1',
      title: 'Software Engineer',
      companyUid: 'company123',
      isActive: true,
      isPaused: false,
    },
    {
      id: 'listing2',
      title: 'Product Manager',
      companyUid: 'company123',
      isActive: true,
      isPaused: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get all active listings', async () => {
    const mockSnapshot = {
      docs: mockListings.map(listing => ({
        id: listing.id,
        data: () => ({ ...listing }),
      })),
    };
    (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

    const request = new NextRequest('http://localhost/api/listings');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.listings).toHaveLength(2);
    expect(data.listings[0].id).toBe('listing1');
    expect(where).toHaveBeenCalledWith('isActive', '==', true);
    expect(where).toHaveBeenCalledWith('isPaused', '==', false);
  });

  it('should filter listings by company UID', async () => {
    const mockSnapshot = {
      docs: mockListings.map(listing => ({
        id: listing.id,
        data: () => ({ ...listing }),
      })),
    };
    (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

    const request = new NextRequest('http://localhost/api/listings?companyUid=company123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(where).toHaveBeenCalledWith('companyUid', '==', 'company123');
    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('should return empty array when no listings found', async () => {
    const mockSnapshot = {
      docs: [],
    };
    (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

    const request = new NextRequest('http://localhost/api/listings');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.listings).toHaveLength(0);
  });

  it('should order listings by creation date descending', async () => {
    const mockSnapshot = {
      docs: [],
    };
    (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

    const request = new NextRequest('http://localhost/api/listings');

    await GET(request);

    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('should handle errors during listing retrieval', async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const request = new NextRequest('http://localhost/api/listings');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get listings');
  });
});

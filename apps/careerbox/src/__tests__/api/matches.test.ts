import { GET } from '@/app/api/matches/route';
import { NextRequest } from 'next/server';
import { getMatchesForIndividual, getMatchesForCompany } from '@/lib/matching-engine';

// Mock matching engine
jest.mock('@/lib/matching-engine', () => ({
  getMatchesForIndividual: jest.fn(),
  getMatchesForCompany: jest.fn(),
}));

describe('GET /api/matches', () => {
  const mockMatches = [
    { id: 'match1', score: 95, listingId: 'listing1' },
    { id: 'match2', score: 90, listingId: 'listing2' },
    { id: 'match3', score: 85, listingId: 'listing3' },
    { id: 'match4', score: 80, listingId: 'listing4' },
    { id: 'match5', score: 75, listingId: 'listing5' },
    { id: 'match6', score: 70, listingId: 'listing6' },
    { id: 'match7', score: 65, listingId: 'listing7' },
    { id: 'match8', score: 60, listingId: 'listing8' },
    { id: 'match9', score: 55, listingId: 'listing9' },
    { id: 'match10', score: 50, listingId: 'listing10' },
    { id: 'match11', score: 45, listingId: 'listing11' },
    { id: 'match12', score: 40, listingId: 'listing12' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Parameter Validation', () => {
    it('should return 400 if uid is missing', async () => {
      const request = new NextRequest('http://localhost/api/matches?userType=individual');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 if userType is missing', async () => {
      const request = new NextRequest('http://localhost/api/matches?uid=user123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });

    it('should return 400 if both uid and userType are missing', async () => {
      const request = new NextRequest('http://localhost/api/matches');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });
  });

  describe('Individual Matches', () => {
    it('should get matches for individual user', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getMatchesForIndividual).toHaveBeenCalledWith('user123', 'classic');
      expect(getMatchesForCompany).not.toHaveBeenCalled();
    });

    it('should default to free tier if not specified', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual');

      await GET(request);

      expect(getMatchesForIndividual).toHaveBeenCalledWith('user123', 'free');
    });
  });

  describe('Company Matches', () => {
    it('should get matches for company user', async () => {
      (getMatchesForCompany as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=company456&userType=company&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getMatchesForCompany).toHaveBeenCalledWith('company456', 'classic');
      expect(getMatchesForIndividual).not.toHaveBeenCalled();
    });
  });

  describe('Free Tier Filtering', () => {
    it('should return only count for free tier users', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=free');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(12);
      expect(data.matches).toBeNull();
    });

    it('should not expose match data for free tier', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=free');

      const response = await GET(request);
      const data = await response.json();

      expect(data.matches).toBeNull();
      expect(data.count).toBe(12);
    });
  });

  describe('Entry Tier Filtering', () => {
    it('should limit matches to 10 for entry tier users', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=entry');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(12);
      expect(data.matches).toHaveLength(10);
      expect(data.limit).toBe(10);
      expect(data.remaining).toBe(0);
    });

    it('should show remaining matches for entry tier', async () => {
      const fewMatches = mockMatches.slice(0, 5);
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(fewMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=entry');

      const response = await GET(request);
      const data = await response.json();

      expect(data.count).toBe(5);
      expect(data.matches).toHaveLength(5);
      expect(data.limit).toBe(10);
      expect(data.remaining).toBe(5);
    });

    it('should not show negative remaining count', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=entry');

      const response = await GET(request);
      const data = await response.json();

      expect(data.remaining).toBe(0);
      expect(data.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Classic Tier Filtering', () => {
    it('should return unlimited matches for classic tier users', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(12);
      expect(data.matches).toHaveLength(12);
      expect(data.limit).toBe('unlimited');
    });

    it('should return all matches without slicing for classic tier', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(data.matches).toEqual(mockMatches);
      expect(data.matches).toHaveLength(mockMatches.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from matching engine for individuals', async () => {
      (getMatchesForIndividual as jest.Mock).mockRejectedValue(new Error('Matching error'));

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get matches');
    });

    it('should handle errors from matching engine for companies', async () => {
      (getMatchesForCompany as jest.Mock).mockRejectedValue(new Error('Matching error'));

      const request = new NextRequest('http://localhost/api/matches?uid=company456&userType=company&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get matches');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty matches array', async () => {
      (getMatchesForIndividual as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=classic');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(0);
      expect(data.matches).toEqual([]);
    });

    it('should handle exactly 10 matches for entry tier', async () => {
      const exactlyTenMatches = mockMatches.slice(0, 10);
      (getMatchesForIndividual as jest.Mock).mockResolvedValue(exactlyTenMatches);

      const request = new NextRequest('http://localhost/api/matches?uid=user123&userType=individual&tier=entry');

      const response = await GET(request);
      const data = await response.json();

      expect(data.count).toBe(10);
      expect(data.matches).toHaveLength(10);
      expect(data.remaining).toBe(0);
    });
  });
});

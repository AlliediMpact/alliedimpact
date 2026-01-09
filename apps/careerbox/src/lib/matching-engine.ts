/**
 * CareerBox Matching Engine
 * Rule-based matching algorithm with weighted factors
 */

import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import type { 
  IndividualProfile, 
  PositionListing, 
  Match 
} from '@/types';

// ============================================================================
// MATCHING WEIGHTS
// ============================================================================

const MATCHING_WEIGHTS = {
  role: 0.40,        // 40% - Most important
  location: 0.30,    // 30% - Second most important
  industry: 0.15,    // 15% - Third
  skills: 0.10,      // 10% - Fourth
  availability: 0.05 // 5% - Least important
};

const MINIMUM_MATCH_SCORE = 50; // Only show matches >= 50%

// ============================================================================
// MATCHING ENGINE
// ============================================================================

/**
 * Calculate match score between individual and position
 */
export function calculateMatchScore(
  individual: IndividualProfile,
  listing: PositionListing
): {
  score: number;
  reasons: string[];
} {
  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Role Matching (40%)
  const roleScore = calculateRoleMatch(individual.desiredRoles, listing.title);
  totalScore += roleScore * MATCHING_WEIGHTS.role;
  if (roleScore > 70) {
    reasons.push('Strong role match');
  } else if (roleScore > 50) {
    reasons.push('Good role alignment');
  }

  // 2. Location Matching (30%)
  const locationScore = calculateLocationMatch(
    individual.currentLocation,
    individual.relocationPreference,
    listing.location
  );
  totalScore += locationScore * MATCHING_WEIGHTS.location;
  if (locationScore === 100) {
    reasons.push('Perfect location match');
  } else if (locationScore > 70) {
    reasons.push('Willing to relocate');
  }

  // 3. Industry Matching (15%)
  const industryScore = calculateIndustryMatch(individual.industry, listing.industry);
  totalScore += industryScore * MATCHING_WEIGHTS.industry;
  if (industryScore === 100) {
    reasons.push('Same industry');
  }

  // 4. Skills Matching (10%)
  const skillsScore = calculateSkillsMatch(individual.skills, listing.requiredSkills);
  totalScore += skillsScore * MATCHING_WEIGHTS.skills;
  if (skillsScore > 70) {
    reasons.push('Strong skills overlap');
  } else if (skillsScore > 50) {
    reasons.push('Some skills match');
  }

  // 5. Availability Matching (5%)
  const availabilityScore = calculateAvailabilityMatch(
    individual.availability,
    listing.startDate
  );
  totalScore += availabilityScore * MATCHING_WEIGHTS.availability;
  if (availabilityScore === 100) {
    reasons.push('Availability aligns');
  }

  // Round score to whole number
  const finalScore = Math.round(totalScore);

  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ['Basic compatibility'],
  };
}

/**
 * Calculate role match score
 */
function calculateRoleMatch(desiredRoles: string[], listingTitle: string): number {
  if (!desiredRoles || desiredRoles.length === 0) return 0;

  const titleLower = listingTitle.toLowerCase();
  
  // Check for exact match
  for (const role of desiredRoles) {
    if (titleLower.includes(role.toLowerCase()) || role.toLowerCase().includes(titleLower)) {
      return 100;
    }
  }

  // Check for partial match (keywords)
  const titleKeywords = extractKeywords(titleLower);
  let matchCount = 0;
  
  for (const role of desiredRoles) {
    const roleKeywords = extractKeywords(role.toLowerCase());
    const overlap = titleKeywords.filter(kw => roleKeywords.includes(kw));
    matchCount += overlap.length;
  }

  // Score based on keyword overlap
  if (matchCount >= 3) return 80;
  if (matchCount === 2) return 60;
  if (matchCount === 1) return 40;
  
  return 20; // Some relevance
}

/**
 * Calculate location match score
 */
function calculateLocationMatch(
  currentLocation: { city: string; province: string; country: string },
  relocationPreference: { willingToRelocate: boolean; preferredLocations: string[] },
  listingLocation: { city: string; province: string; country: string }
): number {
  // Same city = perfect match
  if (currentLocation.city.toLowerCase() === listingLocation.city.toLowerCase()) {
    return 100;
  }

  // Willing to relocate?
  if (!relocationPreference.willingToRelocate) {
    // Not willing, but different city = no match
    return 0;
  }

  // Check if listing location is in preferred locations
  const preferredCities = relocationPreference.preferredLocations.map(loc => loc.toLowerCase());
  
  if (preferredCities.includes(listingLocation.city.toLowerCase()) ||
      preferredCities.includes(listingLocation.province.toLowerCase())) {
    return 90; // High match, preferred relocation target
  }

  // Same province, willing to relocate
  if (currentLocation.province.toLowerCase() === listingLocation.province.toLowerCase()) {
    return 70;
  }

  // Same country, willing to relocate
  if (currentLocation.country.toLowerCase() === listingLocation.country.toLowerCase()) {
    return 50;
  }

  // Different country, but willing to relocate
  return 30;
}

/**
 * Calculate industry match score
 */
function calculateIndustryMatch(individualIndustry: string, listingIndustry: string): number {
  if (!individualIndustry || !listingIndustry) return 50;

  const ind1 = individualIndustry.toLowerCase();
  const ind2 = listingIndustry.toLowerCase();

  // Exact match
  if (ind1 === ind2) return 100;

  // Partial match (e.g., "FinTech" contains "Tech")
  if (ind1.includes(ind2) || ind2.includes(ind1)) return 80;

  // Related industries (could expand this with a mapping)
  const relatedIndustries: Record<string, string[]> = {
    'fintech': ['banking', 'finance', 'technology'],
    'healthcare': ['medical', 'pharma', 'biotech'],
    'ecommerce': ['retail', 'technology', 'logistics'],
  };

  for (const [key, related] of Object.entries(relatedIndustries)) {
    if (ind1.includes(key) && related.some(r => ind2.includes(r))) {
      return 60;
    }
    if (ind2.includes(key) && related.some(r => ind1.includes(r))) {
      return 60;
    }
  }

  return 30; // Different, but some relevance
}

/**
 * Calculate skills match score
 */
function calculateSkillsMatch(individualSkills: string[], requiredSkills: string[]): number {
  if (!individualSkills || individualSkills.length === 0) return 0;
  if (!requiredSkills || requiredSkills.length === 0) return 50; // No requirements = neutral

  const indSkillsLower = individualSkills.map(s => s.toLowerCase());
  const reqSkillsLower = requiredSkills.map(s => s.toLowerCase());

  // Count exact matches
  let exactMatches = 0;
  let partialMatches = 0;

  for (const reqSkill of reqSkillsLower) {
    if (indSkillsLower.includes(reqSkill)) {
      exactMatches++;
    } else if (indSkillsLower.some(indSkill => indSkill.includes(reqSkill) || reqSkill.includes(indSkill))) {
      partialMatches++;
    }
  }

  const totalRequired = requiredSkills.length;
  const matchRatio = (exactMatches + partialMatches * 0.5) / totalRequired;

  return Math.min(100, Math.round(matchRatio * 100));
}

/**
 * Calculate availability match score
 */
function calculateAvailabilityMatch(
  individualAvailability: string,
  listingStartDate: string
): number {
  const availabilityOrder = ['immediately', '1-month', '2-months', '3-months+'];
  
  const indIndex = availabilityOrder.indexOf(individualAvailability);
  const listIndex = availabilityOrder.indexOf(listingStartDate);

  if (indIndex === -1 || listIndex === -1) return 50;

  // Perfect match
  if (indIndex === listIndex) return 100;

  // Individual available earlier than needed (good)
  if (indIndex < listIndex) return 90;

  // Individual available later (not ideal)
  const gap = indIndex - listIndex;
  if (gap === 1) return 70;
  if (gap === 2) return 50;
  
  return 30;
}

/**
 * Extract keywords from text (simple implementation)
 */
function extractKeywords(text: string): string[] {
  // Remove common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return text
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => word.toLowerCase());
}

// ============================================================================
// MATCH CREATION & MANAGEMENT
// ============================================================================

/**
 * Find matches for an individual (called on profile update or real-time)
 */
export async function findMatchesForIndividual(
  individualUid: string
): Promise<Match[]> {
  try {
    // Get individual profile
    const individualRef = doc(db, 'careerbox_individuals', individualUid);
    const individualSnap = await getDocs(query(collection(db, 'careerbox_individuals'), where('uid', '==', individualUid)));
    
    if (individualSnap.empty) {
      console.error('Individual profile not found');
      return [];
    }

    const individual = individualSnap.docs[0].data() as IndividualProfile;

    // Only match if profile is complete and active
    if (!individual.profileComplete || !individual.isActive) {
      return [];
    }

    // Get all active listings
    const listingsQuery = query(
      collection(db, 'careerbox_listings'),
      where('isActive', '==', true),
      where('isPaused', '==', false)
    );

    const listingsSnap = await getDocs(listingsQuery);
    const matches: Match[] = [];

    // Calculate match score for each listing
    for (const listingDoc of listingsSnap.docs) {
      const listing = listingDoc.data() as PositionListing;

      const { score, reasons } = calculateMatchScore(individual, listing);

      // Only create match if score meets minimum threshold
      if (score >= MINIMUM_MATCH_SCORE) {
        const matchId = `${individualUid}_${listing.companyUid}_${listing.id}`;

        const match: Match = {
          id: matchId,
          individualUid: individual.uid,
          individualName: individual.displayName,
          individualPhotoURL: individual.photoURL,
          companyUid: listing.companyUid,
          companyName: listing.companyName,
          companyLogoURL: listing.companyLogoURL,
          listingId: listing.id,
          listingTitle: listing.title,
          matchScore: score,
          matchReasons: reasons,
          status: 'pending',
          visibleToIndividual: true,
          visibleToCompany: true,
          individualViewed: false,
          individualViewedAt: null,
          companyViewed: false,
          companyViewedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        // Save match to Firestore
        await setDoc(doc(db, 'careerbox_matches', matchId), match);

        matches.push(match);
      }
    }

    return matches;
  } catch (error) {
    console.error('Error finding matches for individual:', error);
    return [];
  }
}

/**
 * Find matches for a company listing (called when listing is created/updated)
 */
export async function findMatchesForListing(
  listingId: string
): Promise<Match[]> {
  try {
    // Get listing
    const listingSnap = await getDocs(query(collection(db, 'careerbox_listings'), where('id', '==', listingId)));
    
    if (listingSnap.empty) {
      console.error('Listing not found');
      return [];
    }

    const listing = listingSnap.docs[0].data() as PositionListing;

    // Only match if listing is active
    if (!listing.isActive || listing.isPaused) {
      return [];
    }

    // Get all active individual profiles
    const individualsQuery = query(
      collection(db, 'careerbox_individuals'),
      where('profileComplete', '==', true),
      where('isActive', '==', true)
    );

    const individualsSnap = await getDocs(individualsQuery);
    const matches: Match[] = [];

    // Calculate match score for each individual
    for (const individualDoc of individualsSnap.docs) {
      const individual = individualDoc.data() as IndividualProfile;

      const { score, reasons } = calculateMatchScore(individual, listing);

      // Only create match if score meets minimum threshold
      if (score >= MINIMUM_MATCH_SCORE) {
        const matchId = `${individual.uid}_${listing.companyUid}_${listing.id}`;

        const match: Match = {
          id: matchId,
          individualUid: individual.uid,
          individualName: individual.displayName,
          individualPhotoURL: individual.photoURL,
          companyUid: listing.companyUid,
          companyName: listing.companyName,
          companyLogoURL: listing.companyLogoURL,
          listingId: listing.id,
          listingTitle: listing.title,
          matchScore: score,
          matchReasons: reasons,
          status: 'pending',
          visibleToIndividual: true,
          visibleToCompany: true,
          individualViewed: false,
          individualViewedAt: null,
          companyViewed: false,
          companyViewedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        // Save match to Firestore
        await setDoc(doc(db, 'careerbox_matches', matchId), match);

        matches.push(match);
      }
    }

    return matches;
  } catch (error) {
    console.error('Error finding matches for listing:', error);
    return [];
  }
}

/**
 * Get matches for individual (with subscription tier filtering)
 */
export async function getMatchesForIndividual(
  individualUid: string,
  subscriptionTier: 'free' | 'entry' | 'classic'
): Promise<Match[]> {
  try {
    const matchesQuery = query(
      collection(db, 'careerbox_matches'),
      where('individualUid', '==', individualUid),
      where('status', '==', 'pending')
    );

    const matchesSnap = await getDocs(matchesQuery);
    const matches = matchesSnap.docs.map(doc => doc.data() as Match);

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply subscription tier limits
    if (subscriptionTier === 'free') {
      // Free: return count only (frontend will handle display)
      return matches;
    } else if (subscriptionTier === 'entry') {
      // Entry: limit to 10 matches
      return matches.slice(0, 10);
    } else {
      // Classic: unlimited
      return matches;
    }
  } catch (error) {
    console.error('Error getting matches for individual:', error);
    return [];
  }
}

/**
 * Get matches for company (with subscription tier filtering)
 */
export async function getMatchesForCompany(
  companyUid: string,
  subscriptionTier: 'free' | 'entry' | 'classic'
): Promise<Match[]> {
  try {
    const matchesQuery = query(
      collection(db, 'careerbox_matches'),
      where('companyUid', '==', companyUid),
      where('status', '==', 'pending')
    );

    const matchesSnap = await getDocs(matchesQuery);
    const matches = matchesSnap.docs.map(doc => doc.data() as Match);

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply subscription tier limits
    if (subscriptionTier === 'free') {
      // Free: return count only (frontend will handle display)
      return matches;
    } else if (subscriptionTier === 'entry') {
      // Entry: limit to 10 matches
      return matches.slice(0, 10);
    } else {
      // Classic: unlimited
      return matches;
    }
  } catch (error) {
    console.error('Error getting matches for company:', error);
    return [];
  }
}

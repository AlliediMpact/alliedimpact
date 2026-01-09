/**
 * CareerBox Type Definitions
 * Core types for users, profiles, listings, matches, and messages
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER TYPES
// ============================================================================

export type UserType = 'individual' | 'company';

export type SubscriptionTier = 'free' | 'entry' | 'classic';

export interface BaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  userType: UserType;
  subscriptionTier: SubscriptionTier;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  emailVerified: boolean;
  disabled: boolean;
}

// ============================================================================
// INDIVIDUAL PROFILES
// ============================================================================

export interface IndividualProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  
  // Professional Info
  currentRole: string;
  desiredRoles: string[]; // Array of role preferences
  industry: string;
  skills: string[]; // Lightweight skill tags
  experienceYears: number;
  
  // Location
  currentLocation: {
    city: string;
    province: string;
    country: string;
    coordinates?: { lat: number; lng: number }; // Optional exact location
  };
  
  relocationPreference: {
    willingToRelocate: boolean;
    preferredLocations: string[]; // Cities/provinces
  };
  
  // Availability
  availability: 'immediately' | '1-month' | '2-months' | '3-months+';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  
  // Profile Status
  profileComplete: boolean;
  isActive: boolean; // Can pause profile
  
  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionStartDate: Date | Timestamp;
  subscriptionEndDate: Date | Timestamp | null;
  
  // Usage Tracking (for tier limits)
  monthlyStats: {
    matchesViewed: number;
    messagesSent: number;
    resetDate: Date | Timestamp; // Reset monthly
  };
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastActiveAt: Date | Timestamp;
}

// ============================================================================
// COMPANY PROFILES
// ============================================================================

export interface CompanyProfile {
  uid: string; // Company user ID
  email: string;
  companyName: string;
  logoURL: string | null;
  
  // Company Info
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website: string | null;
  description: string;
  
  // Locations (companies can have multiple offices)
  locations: Array<{
    city: string;
    province: string;
    country: string;
    isPrimary: boolean;
    coordinates?: { lat: number; lng: number };
  }>;
  
  // Profile Status
  profileComplete: boolean;
  isActive: boolean;
  verified: boolean; // Admin verification for legitimacy
  
  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionStartDate: Date | Timestamp;
  subscriptionEndDate: Date | Timestamp | null;
  
  // Usage Tracking
  monthlyStats: {
    activeListings: number;
    matchesViewed: number;
    messagesSent: number;
    resetDate: Date | Timestamp;
  };
  
  // Team Members (Classic plan only)
  teamMembers?: Array<{
    uid: string;
    name: string;
    email: string;
    role: 'admin' | 'recruiter' | 'viewer';
  }>;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastActiveAt: Date | Timestamp;
}

// ============================================================================
// POSITION LISTINGS
// ============================================================================

export interface PositionListing {
  id: string;
  companyUid: string; // Owner company
  companyName: string;
  companyLogoURL: string | null;
  
  // Position Details
  title: string;
  description: string;
  industry: string;
  requiredSkills: string[];
  experienceYears: {
    min: number;
    max: number;
  };
  
  // Employment Details
  employmentType: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Location
  location: {
    city: string;
    province: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Availability
  startDate: 'immediately' | '1-month' | '2-months' | '3-months+';
  urgency: 'low' | 'medium' | 'high';
  
  // Status
  isActive: boolean;
  isPaused: boolean;
  expiresAt: Date | Timestamp | null; // Auto-expire after 90 days
  
  // Stats
  viewCount: number;
  matchCount: number;
  applicationCount: number;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ============================================================================
// MATCHES
// ============================================================================

export interface Match {
  id: string;
  
  // Match Parties
  individualUid: string;
  individualName: string;
  individualPhotoURL: string | null;
  
  companyUid: string;
  companyName: string;
  companyLogoURL: string | null;
  
  listingId: string;
  listingTitle: string;
  
  // Match Score (0-100)
  matchScore: number;
  matchReasons: string[]; // ["Same industry", "Location match", "Skills overlap"]
  
  // Match Status
  status: 'pending' | 'viewed' | 'contacted' | 'interview_scheduled' | 'offer_made' | 'hired' | 'rejected' | 'expired';
  
  // Visibility (based on subscription tier)
  visibleToIndividual: boolean;
  visibleToCompany: boolean;
  
  // Actions
  individualViewed: boolean;
  individualViewedAt: Date | Timestamp | null;
  
  companyViewed: boolean;
  companyViewedAt: Date | Timestamp | null;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  expiresAt: Date | Timestamp; // Matches expire after 30 days if no action
}

// ============================================================================
// MESSAGES
// ============================================================================

export interface Message {
  id: string;
  
  // Conversation
  conversationId: string; // Format: "individualUid_companyUid_listingId"
  matchId: string; // Reference to match
  
  // Sender/Receiver
  senderUid: string;
  senderName: string;
  senderType: 'individual' | 'company';
  
  recipientUid: string;
  recipientName: string;
  recipientType: 'individual' | 'company';
  
  // Message Content
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  
  // Status
  isRead: boolean;
  readAt: Date | Timestamp | null;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Conversation {
  id: string; // Format: "individualUid_companyUid_listingId"
  
  // Participants
  individualUid: string;
  individualName: string;
  
  companyUid: string;
  companyName: string;
  
  listingId: string;
  listingTitle: string;
  
  // Last Message
  lastMessage: string;
  lastMessageAt: Date | Timestamp;
  lastMessageBy: string; // uid
  
  // Unread Counts
  unreadByIndividual: number;
  unreadByCompany: number;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ============================================================================
// MODERATION FLAGS
// ============================================================================

export interface ModerationFlag {
  id: string;
  
  // Flagged Content
  contentType: 'profile' | 'listing' | 'message';
  contentId: string;
  contentOwnerId: string;
  
  // Flag Details
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFlagged: boolean; // AI-detected
  reportedByUid?: string; // User-reported (optional)
  
  // Status
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date | Timestamp;
  resolution?: string;
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ============================================================================
// SUCCESS TRACKING
// ============================================================================

export interface JobPlacement {
  id: string;
  
  // Participants
  individualUid: string;
  individualName: string;
  
  companyUid: string;
  companyName: string;
  
  matchId: string;
  listingId: string;
  positionTitle: string;
  
  // Placement Details
  startDate: Date | Timestamp;
  salaryOffered?: number;
  
  // Status
  status: 'accepted' | 'started' | 'active' | 'ended';
  
  // Feedback
  individualFeedback?: string;
  companyFeedback?: string;
  individualRating?: number; // 1-5
  companyRating?: number; // 1-5
  
  // Metadata
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ============================================================================
// SUBSCRIPTION LIMITS
// ============================================================================

export interface SubscriptionLimits {
  tier: SubscriptionTier;
  
  // Match Limits
  matchesPerMonth: number | 'unlimited';
  matchVisibility: 'count-only' | 'names-only' | 'full-profiles';
  
  // Messaging Limits
  messagesPerMonth: number | 'unlimited';
  messagingEnabled: boolean;
  
  // Location Visibility
  locationDetail: 'none' | 'city-province' | 'exact';
  
  // Additional Features
  priorityMatching: boolean;
  advancedFilters: boolean;
  teamMembers: number; // For companies
  
  // Price
  priceMonthly: number; // ZAR
  priceYearly?: number; // ZAR
}

// Predefined limits
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    tier: 'free',
    matchesPerMonth: 0, // See count only
    matchVisibility: 'count-only',
    messagesPerMonth: 0,
    messagingEnabled: false,
    locationDetail: 'none',
    priorityMatching: false,
    advancedFilters: false,
    teamMembers: 0,
    priceMonthly: 0,
  },
  entry: {
    tier: 'entry',
    matchesPerMonth: 10,
    matchVisibility: 'full-profiles',
    messagesPerMonth: 5,
    messagingEnabled: true,
    locationDetail: 'city-province',
    priorityMatching: false,
    advancedFilters: false,
    teamMembers: 1,
    priceMonthly: 1000,
  },
  classic: {
    tier: 'classic',
    matchesPerMonth: 'unlimited',
    matchVisibility: 'full-profiles',
    messagesPerMonth: 'unlimited',
    messagingEnabled: true,
    locationDetail: 'exact',
    priorityMatching: true,
    advancedFilters: true,
    teamMembers: 5,
    priceMonthly: 5000,
  },
};

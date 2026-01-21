/**
 * SportsHub Type Definitions
 * Multi-Project Sports Engagement Platform
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// PROJECT TYPES (NEW - Phase 1.5)
// ============================================================================

export type ProjectType = 
  | 'voting_tournament'    // CupFinal-style voting events
  | 'information'          // Lesotho-style info pages
  | 'fundraising'          // Future: donation campaigns
  | 'ticketing'            // Future: event tickets
  | 'merchandise';         // Future: store

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface Project {
  id: string;
  name: string;
  slug: string; // URL-friendly: "cupfinal", "lesotho"
  type: ProjectType;
  description: string;
  status: ProjectStatus;
  
  // Configuration (type-specific)
  config: ProjectConfig;
  
  // Branding (optional overrides)
  logo?: string;
  banner?: string;
  
  // Metadata
  createdBy: string; // ControlBox admin userId
  createdAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  
  // Metrics
  participantCount?: number;
  revenueInCents?: number;
}

export interface ProjectConfig {
  // Common fields
  requiresWallet: boolean;
  
  // Voting projects
  votingPrice?: number; // in cents (200 = R2)
  votingEnabled?: boolean;
  
  // Information projects
  hasContentPages?: boolean;
  allowComments?: boolean;
  
  // Future expansion
  [key: string]: any;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type GlobalRole = 'user' | 'sportshub_super_admin';
export type ProjectRole = 'viewer' | 'admin' | 'super_admin';

export interface SportsHubUser {
  userId: string;
  email: string;
  displayName: string;
  globalRole: GlobalRole; // Platform-wide role
  
  // Verification
  emailVerified: boolean;
  phoneVerified?: boolean;
  
  // Fraud detection
  flaggedForFraud: boolean;
  flagReason?: string;
  flaggedAt?: Date;
  flaggedBy?: string;
  
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProjectRole {
  userId: string;
  projectId: string;
  role: ProjectRole;
  grantedBy: string;
  grantedAt: Date;
}

// ============================================================================
// TOURNAMENT TYPES (Project-Scoped - Phase 2)
// These belong to voting_tournament type projects (e.g., CupFinal)
// ============================================================================

export type TournamentStatus = 'draft' | 'open' | 'closed' | 'completed';
export type VotingItemType = 'team' | 'venue' | 'format';
export type TiebreakerRule = 'sudden-death' | 'random' | 'admin-decision';

export interface VotingOption {
  id: string;
  label: string;
  imageUrl?: string;
  description?: string;
}

export interface VotingWindow {
  opens: Date;
  closes: Date;
}

export interface VotingItem {
  id: string;
  type: VotingItemType;
  title: string;
  description: string;
  options: VotingOption[];
  votingWindow: VotingWindow;
  maxVotesPerUser?: number; // null = unlimited
  tiebreaker: TiebreakerRule;
}

export interface Tournament {
  tournamentId: string;
  projectId: string; // NEW: Belongs to which project (e.g., "cupfinal")
  name: string;
  description: string;
  status: TournamentStatus;
  startTime: Date;
  endTime: Date;
  votingItems: VotingItem[];
  createdBy: string; // admin userId
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// VOTE TYPES (Project-Scoped)
// ============================================================================

export interface Vote {
  voteId: string;
  userId: string;
  projectId: string; // NEW: Which project this vote belongs to
  tournamentId: string;
  votingItemId: string;
  selectedOption: string;
  
  // Audit trail
  timestamp: Date;
  walletBalanceBefore: number; // in cents
  walletBalanceAfter: number; // in cents
  
  // Fraud detection
  ipAddress: string; // hashed for privacy
  deviceFingerprint?: string;
  captchaToken: string;
  
  // Payment tracking
  paymentId?: string;
  
  // Immutability flag
  immutable: true;
}

// ============================================================================
// WALLET TYPES (Global - Shared Across All Projects)
// ============================================================================

export type TransactionType = 'topup' | 'vote' | 'refund-admin';

export interface WalletTransaction {
  transactionId: string;
  type: TransactionType;
  amount: number; // positive for topup, negative for vote
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
  
  // For topup
  paymentId?: string;
  paymentMethod?: 'payfast';
  
  // For vote (project-scoped)
  projectId?: string; // NEW: Which project the vote was for
  voteId?: string;
  votingItemId?: string;
  
  // For refund (rare, admin override)
  adminUserId?: string;
  reason?: string;
}

export interface Wallet {
  userId: string;
  balance: number; // in cents (e.g., 2000 = R20.00)
  transactionHistory: WalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PayFastData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  amount_gross: number;
  amount_fee: number;
  amount_net: number;
}

export interface Payment {
  paymentId: string;
  userId: string;
  amount: number; // in cents
  status: PaymentStatus;
  payfastData: PayFastData;
  
  // Reconciliation
  walletCreditApplied: boolean;
  walletCreditedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// VOTE TALLY TYPES (Distributed Counter - Project-Scoped)
// ============================================================================

export interface VoteTallyShard {
  count: number;
}

export interface VoteTally {
  tallyId: string; // {projectId}_{tournamentId}_{votingItemId}_{option}
  projectId: string; // NEW: Which project this tally belongs to
  tournamentId: string;
  votingItemId: string;
  option: string;
  
  // Distributed shards (10 shards to prevent write contention)
  shards: {
    [shardId: string]: VoteTallyShard;
  };
  
  // Cached total (updated periodically)
  totalVotes: number;
  lastUpdated: Date;
}

// ============================================================================
// ADMIN LOG TYPES (Platform-Wide)
// ============================================================================

export type AdminAction = 
  | 'create_project'
  | 'update_project'
  | 'archive_project'
  | 'publish_project'
  | 'pause_voting'
  | 'unpause_voting'
  | 'flag_user'
  | 'unflag_user'
  | 'void_voting_item'
  | 'export_data'
  | 'manual_refund'
  | 'create_tournament'
  | 'update_tournament'
  | 'delete_tournament';

export type AdminLogTargetType = 'project' | 'tournament' | 'user' | 'voting_item' | 'vote';

export interface AdminLog {
  logId: string;
  adminUserId: string;
  action: AdminAction;
  targetType: AdminLogTargetType;
  targetId: string;
  projectId?: string; // NEW: If action is project-specific
  reason: string; // mandatory
  ipAddress: string;
  timestamp: Date;
  
  // For voids/refunds
  affectedVotes?: number;
  affectedUsers?: number;
}

// ============================================================================
// FRONTEND TYPES
// ============================================================================

export interface DashboardStats {
  totalVotes: number;
  walletBalance: number;
  activeVotes: number;
  completedTournaments: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalVotes: number;
  totalRevenue: number;
  activeTournaments: number;
  flaggedUsers: number;
}

export interface VoteHistoryItem {
  voteId: string;
  tournamentName: string;
  votingItemTitle: string;
  selectedOption: string;
  timestamp: Date;
  amount: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface TopUpFormData {
  amount: number; // 1000, 2000, 5000, 10000 (R10, R20, R50, R100)
}

export interface VoteFormData {
  tournamentId: string;
  votingItemId: string;
  selectedOption: string;
  captchaToken: string;
}

export interface CreateTournamentFormData {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface CreateVotingItemFormData {
  type: VotingItemType;
  title: string;
  description: string;
  options: VotingOption[];
  votingWindow: VotingWindow;
  maxVotesPerUser?: number;
  tiebreaker: TiebreakerRule;
}

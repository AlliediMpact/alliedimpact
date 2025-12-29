/**
 * KYC Types and Interfaces
 * Phase 4: Identity Verification System
 */

export type KYCLevel = 0 | 1 | 2 | 3;

export type KYCStatus = 
  | "not-started" 
  | "pending" 
  | "under-review" 
  | "approved" 
  | "rejected" 
  | "expired";

export type DocumentType = 
  | "passport" 
  | "drivers-license" 
  | "national-id" 
  | "voters-card";

export interface KYCProfile {
  userId: string;
  level: KYCLevel;
  status: KYCStatus;
  
  // Level 1: Basic Info
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Level 2: ID Verification
  documentType?: DocumentType;
  documentNumber?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  documentVerified: boolean;
  
  // Level 3: Address Verification
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  proofOfAddressUrl?: string;
  proofOfAddressType?: "utility-bill" | "bank-statement" | "rental-agreement";
  addressVerified: boolean;
  
  // Verification Metadata
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  expiresAt?: Date;
  
  // Limits Based on KYC Level
  dailyTradeLimit: number;
  monthlyTradeLimit: number;
  maxOrderSize: number;
  
  // Audit Trail
  verificationHistory: Array<{
    level: KYCLevel;
    status: KYCStatus;
    timestamp: Date;
    notes?: string;
    reviewedBy?: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCLevelRequirements {
  level: KYCLevel;
  name: string;
  description: string;
  dailyLimit: number;
  monthlyLimit: number;
  maxOrderSize: number;
  canWithdraw: boolean;
  canTrade: boolean;
  requiredFields: string[];
  requiredDocuments: string[];
}

export const KYC_REQUIREMENTS: Record<KYCLevel, KYCLevelRequirements> = {
  0: {
    level: 0,
    name: "Unverified",
    description: "No KYC verification completed",
    dailyLimit: 0,
    monthlyLimit: 0,
    maxOrderSize: 0,
    canWithdraw: false,
    canTrade: false,
    requiredFields: [],
    requiredDocuments: [],
  },
  1: {
    level: 1,
    name: "Basic",
    description: "Basic information and phone verification",
    dailyLimit: 50000, // NGN
    monthlyLimit: 500000,
    maxOrderSize: 25000,
    canWithdraw: false,
    canTrade: true,
    requiredFields: ["firstName", "lastName", "dateOfBirth", "nationality", "phoneNumber"],
    requiredDocuments: [],
  },
  2: {
    level: 2,
    name: "Verified",
    description: "ID verification with document upload",
    dailyLimit: 500000,
    monthlyLimit: 5000000,
    maxOrderSize: 250000,
    canWithdraw: true,
    canTrade: true,
    requiredFields: ["firstName", "lastName", "dateOfBirth", "nationality", "phoneNumber"],
    requiredDocuments: ["documentFront", "documentBack", "selfie"],
  },
  3: {
    level: 3,
    name: "Premium",
    description: "Full verification with proof of address",
    dailyLimit: 5000000,
    monthlyLimit: 50000000,
    maxOrderSize: 2500000,
    canWithdraw: true,
    canTrade: true,
    requiredFields: [
      "firstName",
      "lastName",
      "dateOfBirth",
      "nationality",
      "phoneNumber",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ],
    requiredDocuments: ["documentFront", "documentBack", "selfie", "proofOfAddress"],
  },
};

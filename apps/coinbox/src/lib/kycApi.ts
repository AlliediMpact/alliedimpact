/**
 * KYC Client API
 * Phase 4: Identity Verification System
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";

export type KYCLevel = 0 | 1 | 2 | 3;

export interface KYCProfile {
  userId: string;
  level: KYCLevel;
  status: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  documentVerified: boolean;
  addressVerified: boolean;
  dailyTradeLimit: number;
  monthlyTradeLimit: number;
  maxOrderSize: number;
  verificationHistory: any[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get KYC Profile
 */
export async function getKYCProfile(): Promise<KYCProfile> {
  try {
    const getProfileFn = httpsCallable(functions, "getKYCProfile");
    const result = await getProfileFn({});
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to get KYC profile");
    }
    
    return response.data as KYCProfile;
  } catch (error: any) {
    console.error("Get KYC profile error:", error);
    throw new Error(error.message || "Failed to fetch KYC profile");
  }
}

/**
 * Submit Level 1 KYC
 */
export async function submitKYCLevel1(params: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
}): Promise<void> {
  try {
    const submitFn = httpsCallable(functions, "submitKYCLevel1");
    const result = await submitFn(params);
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to submit KYC Level 1");
    }
  } catch (error: any) {
    console.error("Submit KYC Level 1 error:", error);
    throw new Error(error.message || "Failed to submit Level 1 KYC");
  }
}

/**
 * Submit Level 2 KYC
 */
export async function submitKYCLevel2(params: {
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
}): Promise<void> {
  try {
    const submitFn = httpsCallable(functions, "submitKYCLevel2");
    const result = await submitFn(params);
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to submit KYC Level 2");
    }
  } catch (error: any) {
    console.error("Submit KYC Level 2 error:", error);
    throw new Error(error.message || "Failed to submit Level 2 KYC");
  }
}

/**
 * Submit Level 3 KYC
 */
export async function submitKYCLevel3(params: {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  proofOfAddressUrl: string;
  proofOfAddressType: "utility-bill" | "bank-statement" | "rental-agreement";
}): Promise<void> {
  try {
    const submitFn = httpsCallable(functions, "submitKYCLevel3");
    const result = await submitFn(params);
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to submit KYC Level 3");
    }
  } catch (error: any) {
    console.error("Submit KYC Level 3 error:", error);
    throw new Error(error.message || "Failed to submit Level 3 KYC");
  }
}

/**
 * Upload KYC Document
 */
export async function uploadKYCDocument(params: {
  documentType: string;
  file: File;
}): Promise<string> {
  try {
    // Convert file to base64
    const fileData = await fileToBase64(params.file);
    
    const uploadFn = httpsCallable(functions, "uploadKYCDocument");
    const result = await uploadFn({
      documentType: params.documentType,
      fileData,
      filename: params.file.name,
    });
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to upload document");
    }
    
    return response.data.url;
  } catch (error: any) {
    console.error("Upload document error:", error);
    throw new Error(error.message || "Failed to upload document");
  }
}

/**
 * Helper: Convert File to Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

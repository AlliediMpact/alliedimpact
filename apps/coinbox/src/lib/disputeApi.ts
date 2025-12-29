import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * Client API for Dispute Resolution (Phase 7)
 */

export type DisputeStatus =
  | "open"
  | "under-review"
  | "resolved-buyer"
  | "resolved-seller"
  | "cancelled";

export interface Evidence {
  type: "image" | "document" | "text";
  url?: string;
  description: string;
  uploadedAt: Date;
}

export interface Dispute {
  id: string;
  orderId: string;
  initiatedBy: string;
  againstUserId: string;
  status: DisputeStatus;
  reason: string;
  description: string;
  evidence: Evidence[];
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  resolutionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Open a dispute
 */
export async function openDispute(params: {
  orderId: string;
  reason: string;
  description: string;
  evidence?: Evidence[];
}): Promise<string> {
  const functions = getFunctions();
  const open = httpsCallable(functions, "openDispute");

  const result = await open(params);
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to open dispute");
  }

  return data.data.disputeId;
}

/**
 * Add evidence to a dispute
 */
export async function addDisputeEvidence(params: {
  disputeId: string;
  evidence: Evidence;
}): Promise<void> {
  const functions = getFunctions();
  const addEvidence = httpsCallable(functions, "addDisputeEvidence");

  const result = await addEvidence(params);
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to add evidence");
  }
}

/**
 * Get dispute details
 */
export async function getDisputeDetails(disputeId: string): Promise<Dispute> {
  const functions = getFunctions();
  const getDetails = httpsCallable(functions, "getDisputeDetails");

  const result = await getDetails({ disputeId });
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get dispute");
  }

  return data.data;
}

/**
 * Get user's disputes
 */
export async function getUserDisputes(): Promise<Dispute[]> {
  const functions = getFunctions();
  const getDisputes = httpsCallable(functions, "getUserDisputes");

  const result = await getDisputes({});
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get disputes");
  }

  return data.data.disputes;
}

/**
 * Upload dispute evidence file
 */
export async function uploadDisputeEvidence(params: {
  disputeId: string;
  file: File;
}): Promise<string> {
  const functions = getFunctions();
  const upload = httpsCallable(functions, "uploadDisputeEvidence");

  // Convert file to base64
  const fileData = await fileToBase64(params.file);

  const result = await upload({
    disputeId: params.disputeId,
    fileData,
    filename: params.file.name,
  });

  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to upload evidence");
  }

  return data.data.url;
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

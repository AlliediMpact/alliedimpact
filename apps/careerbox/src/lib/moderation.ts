/**
 * AI Moderation System
 * Automated content flagging for inappropriate content
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ModerationFlag } from '@/types';

// Inappropriate content patterns (basic implementation)
const INAPPROPRIATE_PATTERNS = [
  // Offensive language
  /\b(fuck|shit|damn|ass|bitch|bastard)\b/gi,
  // Discriminatory terms
  /\b(racist|sexist|homophobic|xenophobic)\b/gi,
  // Contact info in profiles (should use messaging)
  /\b\d{10}\b/g, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
  // Spam patterns
  /\b(click here|buy now|limited offer|act now)\b/gi,
  // Violence
  /\b(kill|murder|hurt|harm|violence)\b/gi,
];

/**
 * Check content for inappropriate patterns
 */
function detectInappropriateContent(content: string): {
  isInappropriate: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const reasons: string[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  for (const pattern of INAPPROPRIATE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      const patternName = getPatternName(pattern);
      reasons.push(`Detected: ${patternName}`);
      
      // Determine severity based on pattern type
      if (patternName.includes('violence') || patternName.includes('offensive')) {
        severity = 'high';
      } else if (patternName.includes('discriminatory')) {
        severity = 'critical';
      } else if (patternName.includes('contact info')) {
        severity = 'medium';
      }
    }
  }

  return {
    isInappropriate: reasons.length > 0,
    reasons,
    severity,
  };
}

/**
 * Get pattern name from regex
 */
function getPatternName(pattern: RegExp): string {
  const patternStr = pattern.toString();
  
  if (patternStr.includes('fuck|shit')) return 'offensive language';
  if (patternStr.includes('racist|sexist')) return 'discriminatory terms';
  if (patternStr.includes('d{10}')) return 'contact info (phone)';
  if (patternStr.includes('@')) return 'contact info (email)';
  if (patternStr.includes('click here')) return 'spam patterns';
  if (patternStr.includes('kill|murder')) return 'violence';
  
  return 'inappropriate content';
}

/**
 * Moderate profile content
 */
export async function moderateProfile(
  uid: string,
  profileType: 'individual' | 'company',
  content: {
    displayName?: string;
    description?: string;
    skills?: string[];
    [key: string]: any;
  }
): Promise<{
  approved: boolean;
  flags: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}> {
  const allContent = [
    content.displayName || '',
    content.description || '',
    ...(content.skills || []),
  ].join(' ');

  const result = detectInappropriateContent(allContent);

  if (result.isInappropriate) {
    // Create moderation flag
    await createModerationFlag({
      contentType: 'profile',
      contentId: uid,
      contentOwnerId: uid,
      reason: result.reasons.join(', '),
      severity: result.severity,
      autoFlagged: true,
    });

    return {
      approved: result.severity !== 'critical', // Auto-reject critical content
      flags: result.reasons,
      severity: result.severity,
    };
  }

  return {
    approved: true,
    flags: [],
  };
}

/**
 * Moderate listing content
 */
export async function moderateListing(
  listingId: string,
  companyUid: string,
  content: {
    title: string;
    description: string;
    requiredSkills?: string[];
  }
): Promise<{
  approved: boolean;
  flags: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}> {
  const allContent = [
    content.title,
    content.description,
    ...(content.requiredSkills || []),
  ].join(' ');

  const result = detectInappropriateContent(allContent);

  if (result.isInappropriate) {
    await createModerationFlag({
      contentType: 'listing',
      contentId: listingId,
      contentOwnerId: companyUid,
      reason: result.reasons.join(', '),
      severity: result.severity,
      autoFlagged: true,
    });

    return {
      approved: result.severity !== 'critical',
      flags: result.reasons,
      severity: result.severity,
    };
  }

  return {
    approved: true,
    flags: [],
  };
}

/**
 * Moderate message content
 */
export async function moderateMessage(
  messageId: string,
  senderUid: string,
  content: string
): Promise<{
  approved: boolean;
  flags: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}> {
  const result = detectInappropriateContent(content);

  if (result.isInappropriate) {
    await createModerationFlag({
      contentType: 'message',
      contentId: messageId,
      contentOwnerId: senderUid,
      reason: result.reasons.join(', '),
      severity: result.severity,
      autoFlagged: true,
    });

    return {
      approved: result.severity !== 'critical',
      flags: result.reasons,
      severity: result.severity,
    };
  }

  return {
    approved: true,
    flags: [],
  };
}

/**
 * Create a moderation flag
 */
async function createModerationFlag(
  flagData: Partial<ModerationFlag>
): Promise<void> {
  try {
    await addDoc(collection(db, 'careerbox_moderation'), {
      ...flagData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // TODO: Send notification to admin if severity is high or critical
    if (flagData.severity === 'high' || flagData.severity === 'critical') {
      console.warn(`[MODERATION] ${flagData.severity} severity flag created:`, {
        contentType: flagData.contentType,
        contentId: flagData.contentId,
        reason: flagData.reason,
      });
    }
  } catch (error) {
    console.error('Error creating moderation flag:', error);
  }
}

/**
 * Report content (user-initiated)
 */
export async function reportContent(
  contentType: 'profile' | 'listing' | 'message',
  contentId: string,
  contentOwnerId: string,
  reportedByUid: string,
  reason: string
): Promise<{ success: boolean }> {
  try {
    await createModerationFlag({
      contentType,
      contentId,
      contentOwnerId,
      reason,
      severity: 'medium', // User reports default to medium
      autoFlagged: false,
      reportedByUid,
    });

    return { success: true };
  } catch (error) {
    console.error('Error reporting content:', error);
    return { success: false };
  }
}

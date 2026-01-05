/**
 * Sponsorships Service
 * Manages sponsorships, impact tracking, and beneficiary relationships
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  increment
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { logInfo, logError } from '@allied-impact/shared';

// ==================== ENUMS ====================

export enum SponsorshipType {
  INDIVIDUAL = 'individual', // Sponsor a specific person
  GROUP = 'group', // Sponsor a group/class
  PROGRAM = 'program', // Sponsor an entire program
  PROJECT = 'project', // Sponsor a specific project
  ORGANIZATION = 'organization', // General organizational support
}

export enum SponsorshipStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum ImpactMetricType {
  EDUCATION = 'education', // Students helped, courses completed
  HEALTH = 'health', // Checkups, treatments
  FOOD = 'food', // Meals provided
  SHELTER = 'shelter', // Housing support
  EMPLOYMENT = 'employment', // Jobs created
  COMMUNITY = 'community', // Projects completed
  CUSTOM = 'custom',
}

export enum BeneficiaryStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  PAUSED = 'paused',
  INACTIVE = 'inactive',
}

// ==================== INTERFACES ====================

export interface Sponsorship {
  id: string;
  sponsorId: string; // User ID of sponsor
  sponsorName: string;
  sponsorEmail: string;
  type: SponsorshipType;
  status: SponsorshipStatus;
  amount: number;
  currency: string;
  frequency: PaymentFrequency;
  startDate: Date;
  endDate?: Date;
  nextPaymentDate?: Date;
  totalPaid: number;
  paymentCount: number;
  
  // Relationships
  beneficiaryIds: string[]; // Individual beneficiaries
  programId?: string; // Program being sponsored
  organizationId?: string; // Organization receiving sponsorship
  
  // Details
  purpose: string;
  goals?: string[];
  impactMetrics: ImpactMetric[];
  
  // Settings
  isRecurring: boolean;
  autoRenew: boolean;
  sendUpdates: boolean;
  updateFrequency?: 'weekly' | 'monthly' | 'quarterly';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUpdateSent?: Date;
}

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  age?: number;
  gender?: string;
  photoUrl?: string;
  bio?: string;
  location: {
    city?: string;
    state?: string;
    country: string;
  };
  
  // Relationships
  sponsorshipIds: string[]; // Active sponsorships
  programId?: string;
  organizationId: string;
  
  // Status
  status: BeneficiaryStatus;
  joinDate: Date;
  graduationDate?: Date;
  
  // Impact
  impactStories: ImpactStory[];
  milestones: Milestone[];
  
  // Privacy
  showPersonalInfo: boolean;
  showPhoto: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ImpactMetric {
  id: string;
  type: ImpactMetricType;
  name: string; // e.g., "Students Educated", "Meals Provided"
  value: number;
  target?: number;
  unit: string; // e.g., "students", "meals", "families"
  description?: string;
  updatedAt: Date;
}

export interface ImpactStory {
  id: string;
  beneficiaryId: string;
  sponsorshipId?: string;
  title: string;
  content: string;
  photos?: string[];
  date: Date;
  isPublic: boolean;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedDate: Date;
  category: string; // 'education', 'health', 'personal', etc.
}

export interface SponsorshipUpdate {
  id: string;
  sponsorshipId: string;
  title: string;
  content: string;
  photos?: string[];
  impactMetrics?: ImpactMetric[];
  sentDate: Date;
  readDate?: Date;
}

// ==================== SPONSORSHIP FUNCTIONS ====================

export async function createSponsorship(
  sponsorshipData: Omit<Sponsorship, 'id' | 'totalPaid' | 'paymentCount' | 'createdAt' | 'updatedAt'>
): Promise<Sponsorship> {
  try {
    const db = getFirestore(getApp());
    const sponsorshipRef = doc(collection(db, 'sponsorships'));
    
    const sponsorship: Sponsorship = {
      ...sponsorshipData,
      id: sponsorshipRef.id,
      totalPaid: 0,
      paymentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(sponsorshipRef, {
      ...sponsorship,
      createdAt: Timestamp.fromDate(sponsorship.createdAt),
      updatedAt: Timestamp.fromDate(sponsorship.updatedAt),
      startDate: Timestamp.fromDate(sponsorship.startDate),
      endDate: sponsorship.endDate ? Timestamp.fromDate(sponsorship.endDate) : null,
      nextPaymentDate: sponsorship.nextPaymentDate ? Timestamp.fromDate(sponsorship.nextPaymentDate) : null,
      lastUpdateSent: sponsorship.lastUpdateSent ? Timestamp.fromDate(sponsorship.lastUpdateSent) : null,
      impactMetrics: sponsorship.impactMetrics.map(m => ({
        ...m,
        updatedAt: Timestamp.fromDate(m.updatedAt),
      })),
    });
    
    // Update beneficiaries if any
    for (const beneficiaryId of sponsorship.beneficiaryIds) {
      await addSponsorshipToBeneficiary(beneficiaryId, sponsorship.id);
    }
    
    logInfo('Sponsorship created', { sponsorshipId: sponsorship.id, sponsorId: sponsorship.sponsorId });
    return sponsorship;
  } catch (error) {
    logError('Failed to create sponsorship', { error, sponsorId: sponsorshipData.sponsorId });
    throw error;
  }
}

export async function getSponsorship(sponsorshipId: string): Promise<Sponsorship | null> {
  try {
    const db = getFirestore(getApp());
    const sponsorshipDoc = await getDoc(doc(db, 'sponsorships', sponsorshipId));
    
    if (!sponsorshipDoc.exists()) {
      return null;
    }
    
    const data = sponsorshipDoc.data();
    return {
      ...data,
      id: sponsorshipDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      startDate: data.startDate.toDate(),
      endDate: data.endDate ? data.endDate.toDate() : undefined,
      nextPaymentDate: data.nextPaymentDate ? data.nextPaymentDate.toDate() : undefined,
      lastUpdateSent: data.lastUpdateSent ? data.lastUpdateSent.toDate() : undefined,
      impactMetrics: data.impactMetrics.map((m: any) => ({
        ...m,
        updatedAt: m.updatedAt.toDate(),
      })),
    } as Sponsorship;
  } catch (error) {
    logError('Failed to get sponsorship', { error, sponsorshipId });
    throw error;
  }
}

export async function getSponsorSponsorships(sponsorId: string): Promise<Sponsorship[]> {
  try {
    const db = getFirestore(getApp());
    const sponsorshipsQuery = query(
      collection(db, 'sponsorships'),
      where('sponsorId', '==', sponsorId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(sponsorshipsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        startDate: data.startDate.toDate(),
        endDate: data.endDate ? data.endDate.toDate() : undefined,
        nextPaymentDate: data.nextPaymentDate ? data.nextPaymentDate.toDate() : undefined,
        lastUpdateSent: data.lastUpdateSent ? data.lastUpdateSent.toDate() : undefined,
        impactMetrics: data.impactMetrics.map((m: any) => ({
          ...m,
          updatedAt: m.updatedAt.toDate(),
        })),
      } as Sponsorship;
    });
  } catch (error) {
    logError('Failed to get sponsor sponsorships', { error, sponsorId });
    throw error;
  }
}

export async function updateSponsorship(
  sponsorshipId: string,
  updates: Partial<Omit<Sponsorship, 'id' | 'createdAt' | 'totalPaid' | 'paymentCount'>>
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }
    if (updates.nextPaymentDate) {
      updateData.nextPaymentDate = Timestamp.fromDate(updates.nextPaymentDate);
    }
    if (updates.impactMetrics) {
      updateData.impactMetrics = updates.impactMetrics.map(m => ({
        ...m,
        updatedAt: Timestamp.fromDate(m.updatedAt),
      }));
    }
    
    await updateDoc(doc(db, 'sponsorships', sponsorshipId), updateData);
    logInfo('Sponsorship updated', { sponsorshipId });
  } catch (error) {
    logError('Failed to update sponsorship', { error, sponsorshipId });
    throw error;
  }
}

export async function recordPayment(
  sponsorshipId: string,
  amount: number,
  nextPaymentDate?: Date
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const updateData: any = {
      totalPaid: increment(amount),
      paymentCount: increment(1),
      updatedAt: Timestamp.now(),
    };
    
    if (nextPaymentDate) {
      updateData.nextPaymentDate = Timestamp.fromDate(nextPaymentDate);
    }
    
    await updateDoc(doc(db, 'sponsorships', sponsorshipId), updateData);
    logInfo('Payment recorded', { sponsorshipId, amount });
  } catch (error) {
    logError('Failed to record payment', { error, sponsorshipId, amount });
    throw error;
  }
}

// ==================== BENEFICIARY FUNCTIONS ====================

export async function createBeneficiary(
  beneficiaryData: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Beneficiary> {
  try {
    const db = getFirestore(getApp());
    const beneficiaryRef = doc(collection(db, 'beneficiaries'));
    
    const beneficiary: Beneficiary = {
      ...beneficiaryData,
      id: beneficiaryRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(beneficiaryRef, {
      ...beneficiary,
      createdAt: Timestamp.fromDate(beneficiary.createdAt),
      updatedAt: Timestamp.fromDate(beneficiary.updatedAt),
      dateOfBirth: beneficiary.dateOfBirth ? Timestamp.fromDate(beneficiary.dateOfBirth) : null,
      joinDate: Timestamp.fromDate(beneficiary.joinDate),
      graduationDate: beneficiary.graduationDate ? Timestamp.fromDate(beneficiary.graduationDate) : null,
      impactStories: beneficiary.impactStories.map(s => ({
        ...s,
        date: Timestamp.fromDate(s.date),
        createdAt: Timestamp.fromDate(s.createdAt),
      })),
      milestones: beneficiary.milestones.map(m => ({
        ...m,
        achievedDate: Timestamp.fromDate(m.achievedDate),
      })),
    });
    
    logInfo('Beneficiary created', { beneficiaryId: beneficiary.id, organizationId: beneficiary.organizationId });
    return beneficiary;
  } catch (error) {
    logError('Failed to create beneficiary', { error });
    throw error;
  }
}

export async function getBeneficiary(beneficiaryId: string): Promise<Beneficiary | null> {
  try {
    const db = getFirestore(getApp());
    const beneficiaryDoc = await getDoc(doc(db, 'beneficiaries', beneficiaryId));
    
    if (!beneficiaryDoc.exists()) {
      return null;
    }
    
    const data = beneficiaryDoc.data();
    return {
      ...data,
      id: beneficiaryDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toDate() : undefined,
      joinDate: data.joinDate.toDate(),
      graduationDate: data.graduationDate ? data.graduationDate.toDate() : undefined,
      impactStories: data.impactStories.map((s: any) => ({
        ...s,
        date: s.date.toDate(),
        createdAt: s.createdAt.toDate(),
      })),
      milestones: data.milestones.map((m: any) => ({
        ...m,
        achievedDate: m.achievedDate.toDate(),
      })),
    } as Beneficiary;
  } catch (error) {
    logError('Failed to get beneficiary', { error, beneficiaryId });
    throw error;
  }
}

export async function getOrganizationBeneficiaries(organizationId: string): Promise<Beneficiary[]> {
  try {
    const db = getFirestore(getApp());
    const beneficiariesQuery = query(
      collection(db, 'beneficiaries'),
      where('organizationId', '==', organizationId),
      where('status', '==', BeneficiaryStatus.ACTIVE),
      orderBy('joinDate', 'desc')
    );
    
    const snapshot = await getDocs(beneficiariesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toDate() : undefined,
        joinDate: data.joinDate.toDate(),
        graduationDate: data.graduationDate ? data.graduationDate.toDate() : undefined,
        impactStories: data.impactStories.map((s: any) => ({
          ...s,
          date: s.date.toDate(),
          createdAt: s.createdAt.toDate(),
        })),
        milestones: data.milestones.map((m: any) => ({
          ...m,
          achievedDate: m.achievedDate.toDate(),
        })),
      } as Beneficiary;
    });
  } catch (error) {
    logError('Failed to get organization beneficiaries', { error, organizationId });
    throw error;
  }
}

export async function addSponsorshipToBeneficiary(
  beneficiaryId: string,
  sponsorshipId: string
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const beneficiary = await getBeneficiary(beneficiaryId);
    
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }
    
    await updateDoc(doc(db, 'beneficiaries', beneficiaryId), {
      sponsorshipIds: [...beneficiary.sponsorshipIds, sponsorshipId],
      updatedAt: Timestamp.now(),
    });
    
    logInfo('Sponsorship added to beneficiary', { beneficiaryId, sponsorshipId });
  } catch (error) {
    logError('Failed to add sponsorship to beneficiary', { error, beneficiaryId, sponsorshipId });
    throw error;
  }
}

// ==================== IMPACT TRACKING ====================

export async function addImpactStory(
  beneficiaryId: string,
  story: Omit<ImpactStory, 'id' | 'createdAt'>
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const beneficiary = await getBeneficiary(beneficiaryId);
    
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }
    
    const newStory: ImpactStory = {
      ...story,
      id: `story_${Date.now()}`,
      createdAt: new Date(),
    };
    
    await updateDoc(doc(db, 'beneficiaries', beneficiaryId), {
      impactStories: [
        ...beneficiary.impactStories,
        {
          ...newStory,
          date: Timestamp.fromDate(newStory.date),
          createdAt: Timestamp.fromDate(newStory.createdAt),
        },
      ],
      updatedAt: Timestamp.now(),
    });
    
    logInfo('Impact story added', { beneficiaryId, storyId: newStory.id });
  } catch (error) {
    logError('Failed to add impact story', { error, beneficiaryId });
    throw error;
  }
}

export async function addMilestone(
  beneficiaryId: string,
  milestone: Omit<Milestone, 'id'>
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const beneficiary = await getBeneficiary(beneficiaryId);
    
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }
    
    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone_${Date.now()}`,
    };
    
    await updateDoc(doc(db, 'beneficiaries', beneficiaryId), {
      milestones: [
        ...beneficiary.milestones,
        {
          ...newMilestone,
          achievedDate: Timestamp.fromDate(newMilestone.achievedDate),
        },
      ],
      updatedAt: Timestamp.now(),
    });
    
    logInfo('Milestone added', { beneficiaryId, milestoneId: newMilestone.id });
  } catch (error) {
    logError('Failed to add milestone', { error, beneficiaryId });
    throw error;
  }
}

export async function updateImpactMetrics(
  sponsorshipId: string,
  metrics: ImpactMetric[]
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    
    await updateDoc(doc(db, 'sponsorships', sponsorshipId), {
      impactMetrics: metrics.map(m => ({
        ...m,
        updatedAt: Timestamp.now(),
      })),
      updatedAt: Timestamp.now(),
    });
    
    logInfo('Impact metrics updated', { sponsorshipId });
  } catch (error) {
    logError('Failed to update impact metrics', { error, sponsorshipId });
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

export async function getTotalImpact(sponsorId: string): Promise<{
  totalAmount: number;
  totalBeneficiaries: number;
  activeSponsorships: number;
  impactMetrics: ImpactMetric[];
}> {
  try {
    const sponsorships = await getSponsorSponsorships(sponsorId);
    const activeSponsorships = sponsorships.filter(s => s.status === SponsorshipStatus.ACTIVE);
    
    const totalAmount = sponsorships.reduce((sum, s) => sum + s.totalPaid, 0);
    const beneficiarySet = new Set<string>();
    const metricsMap = new Map<string, ImpactMetric>();
    
    sponsorships.forEach(s => {
      s.beneficiaryIds.forEach(id => beneficiarySet.add(id));
      
      s.impactMetrics.forEach(metric => {
        const existing = metricsMap.get(metric.name);
        if (existing) {
          existing.value += metric.value;
        } else {
          metricsMap.set(metric.name, { ...metric });
        }
      });
    });
    
    return {
      totalAmount,
      totalBeneficiaries: beneficiarySet.size,
      activeSponsorships: activeSponsorships.length,
      impactMetrics: Array.from(metricsMap.values()),
    };
  } catch (error) {
    logError('Failed to get total impact', { error, sponsorId });
    throw error;
  }
}

export function calculateROI(sponsorship: Sponsorship): {
  costPerBeneficiary: number;
  impactPerDollar: Record<string, number>;
} {
  const costPerBeneficiary = sponsorship.beneficiaryIds.length > 0
    ? sponsorship.totalPaid / sponsorship.beneficiaryIds.length
    : 0;
  
  const impactPerDollar: Record<string, number> = {};
  sponsorship.impactMetrics.forEach(metric => {
    if (sponsorship.totalPaid > 0) {
      impactPerDollar[metric.name] = metric.value / sponsorship.totalPaid;
    }
  });
  
  return { costPerBeneficiary, impactPerDollar };
}

/**
 * @allied-impact/organizations
 * 
 * Organization management service for NGOs, institutions, and schools.
 * Handles organization creation, user management, program management, and analytics.
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

/**
 * Organization Types
 */
export enum OrganizationType {
  NGO = 'ngo',
  SCHOOL = 'school',
  INSTITUTION = 'institution',
  GOVERNMENT = 'government',
  CORPORATE = 'corporate',
  COMMUNITY = 'community'
}

/**
 * Organization Status
 */
export enum OrganizationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

/**
 * User Role within Organization
 */
export enum OrganizationRole {
  ADMIN = 'admin',           // Full organization management
  MANAGER = 'manager',       // Manage users and programs
  MEMBER = 'member',         // View only
  BENEFICIARY = 'beneficiary' // Program beneficiary
}

/**
 * Organization Interface
 */
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  
  // Contact Information
  email: string;
  phone?: string;
  website?: string;
  
  // Address
  address?: {
    street?: string;
    city?: string;
    province?: string;
    country: string;
    postalCode?: string;
  };
  
  // Registration
  registrationNumber?: string;
  taxNumber?: string;
  
  // Administrators
  adminIds: string[];
  
  // Members
  memberCount: number;
  beneficiaryCount: number;
  
  // Subscriptions & Programs
  activePrograms: string[];
  subscribedProducts: string[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Settings
  settings?: {
    allowSelfRegistration?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  };
}

/**
 * Organization Member Interface
 */
export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  status: 'active' | 'pending' | 'suspended';
  
  // User Info (cached for performance)
  displayName?: string;
  email?: string;
  photoURL?: string;
  
  // Program Enrollment
  enrolledPrograms: string[];
  
  // Timestamps
  joinedAt: Date;
  lastActiveAt?: Date;
  invitedBy?: string;
}

/**
 * Program Interface (managed by organizations)
 */
export interface OrganizationProgram {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  productId: string; // Which Allied iMpact product
  
  // Enrollment
  enrolledUsers: string[];
  maxParticipants?: number;
  requiresApproval: boolean;
  
  // Sponsorship
  sponsorId?: string;
  sponsorshipAmount?: number;
  
  // Status
  status: 'active' | 'completed' | 'cancelled';
  
  // Dates
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Create a new organization
 */
export async function createOrganization(
  data: Omit<Organization, 'id' | 'memberCount' | 'beneficiaryCount' | 'activePrograms' | 'subscribedProducts' | 'createdAt' | 'updatedAt'>
): Promise<Organization> {
  const db = getFirestore();
  const orgRef = doc(collection(db, 'organizations'));
  
  const organization: Organization = {
    ...data,
    id: orgRef.id,
    memberCount: 0,
    beneficiaryCount: 0,
    activePrograms: [],
    subscribedProducts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(orgRef, {
    ...organization,
    createdAt: Timestamp.fromDate(organization.createdAt),
    updatedAt: Timestamp.fromDate(organization.updatedAt)
  });
  
  return organization;
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: string): Promise<Organization | null> {
  const db = getFirestore();
  const orgDoc = await getDoc(doc(db, 'organizations', orgId));
  
  if (!orgDoc.exists()) {
    return null;
  }
  
  const data = orgDoc.data();
  return {
    ...data,
    id: orgDoc.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as Organization;
}

/**
 * Get organizations where user is admin
 */
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const db = getFirestore();
  const q = query(
    collection(db, 'organizations'),
    where('adminIds', 'array-contains', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Organization;
  });
}

/**
 * Update organization
 */
export async function updateOrganization(
  orgId: string,
  updates: Partial<Omit<Organization, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const db = getFirestore();
  await updateDoc(doc(db, 'organizations', orgId), {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

/**
 * Add member to organization
 */
export async function addOrganizationMember(
  member: Omit<OrganizationMember, 'joinedAt'>
): Promise<void> {
  const db = getFirestore();
  const memberRef = doc(db, 'organization_members', `${member.organizationId}_${member.userId}`);
  
  const memberData: OrganizationMember = {
    ...member,
    joinedAt: new Date()
  };
  
  await setDoc(memberRef, {
    ...memberData,
    joinedAt: Timestamp.fromDate(memberData.joinedAt),
    lastActiveAt: member.lastActiveAt ? Timestamp.fromDate(member.lastActiveAt) : null
  });
  
  // Update organization member count
  const org = await getOrganization(member.organizationId);
  if (org) {
    const countField = member.role === OrganizationRole.BENEFICIARY ? 'beneficiaryCount' : 'memberCount';
    await updateDoc(doc(db, 'organizations', member.organizationId), {
      [countField]: (org[countField] || 0) + 1
    });
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(
  organizationId: string,
  role?: OrganizationRole
): Promise<OrganizationMember[]> {
  const db = getFirestore();
  let q = query(
    collection(db, 'organization_members'),
    where('organizationId', '==', organizationId)
  );
  
  if (role) {
    q = query(q, where('role', '==', role));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      joinedAt: data.joinedAt.toDate(),
      lastActiveAt: data.lastActiveAt?.toDate()
    } as OrganizationMember;
  });
}

/**
 * Update member role
 */
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  newRole: OrganizationRole
): Promise<void> {
  const db = getFirestore();
  const memberRef = doc(db, 'organization_members', `${organizationId}_${userId}`);
  
  await updateDoc(memberRef, {
    role: newRole
  });
  
  // Update admin list if changing to/from admin
  if (newRole === OrganizationRole.ADMIN) {
    await updateDoc(doc(db, 'organizations', organizationId), {
      adminIds: arrayUnion(userId)
    });
  } else {
    const member = await getDoc(memberRef);
    if (member.exists() && member.data().role === OrganizationRole.ADMIN) {
      await updateDoc(doc(db, 'organizations', organizationId), {
        adminIds: arrayRemove(userId)
      });
    }
  }
}

/**
 * Remove member from organization
 */
export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<void> {
  const db = getFirestore();
  const memberRef = doc(db, 'organization_members', `${organizationId}_${userId}`);
  
  const memberDoc = await getDoc(memberRef);
  if (!memberDoc.exists()) {
    throw new Error('Member not found');
  }
  
  const member = memberDoc.data() as OrganizationMember;
  
  // Remove member document
  await deleteDoc(memberRef);
  
  // Update organization counts
  const org = await getOrganization(organizationId);
  if (org) {
    const countField = member.role === OrganizationRole.BENEFICIARY ? 'beneficiaryCount' : 'memberCount';
    await updateDoc(doc(db, 'organizations', organizationId), {
      [countField]: Math.max(0, (org[countField] || 0) - 1)
    });
  }
  
  // Remove from admin list if admin
  if (member.role === OrganizationRole.ADMIN) {
    await updateDoc(doc(db, 'organizations', organizationId), {
      adminIds: arrayRemove(userId)
    });
  }
}

/**
 * Create organization program
 */
export async function createProgram(
  data: Omit<OrganizationProgram, 'id' | 'createdAt' | 'updatedAt'>
): Promise<OrganizationProgram> {
  const db = getFirestore();
  const programRef = doc(collection(db, 'organization_programs'));
  
  const program: OrganizationProgram = {
    ...data,
    id: programRef.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await setDoc(programRef, {
    ...program,
    createdAt: Timestamp.fromDate(program.createdAt),
    updatedAt: Timestamp.fromDate(program.updatedAt),
    startDate: program.startDate ? Timestamp.fromDate(program.startDate) : null,
    endDate: program.endDate ? Timestamp.fromDate(program.endDate) : null
  });
  
  // Update organization active programs
  await updateDoc(doc(db, 'organizations', data.organizationId), {
    activePrograms: arrayUnion(programRef.id)
  });
  
  return program;
}

/**
 * Get organization programs
 */
export async function getOrganizationPrograms(organizationId: string): Promise<OrganizationProgram[]> {
  const db = getFirestore();
  const q = query(
    collection(db, 'organization_programs'),
    where('organizationId', '==', organizationId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate()
    } as OrganizationProgram;
  });
}

/**
 * Enroll user in program
 */
export async function enrollUserInProgram(
  programId: string,
  userId: string
): Promise<void> {
  const db = getFirestore();
  
  // Add user to program
  await updateDoc(doc(db, 'organization_programs', programId), {
    enrolledUsers: arrayUnion(userId)
  });
  
  // Add program to user's enrolled programs
  const programDoc = await getDoc(doc(db, 'organization_programs', programId));
  if (programDoc.exists()) {
    const program = programDoc.data() as OrganizationProgram;
    const memberRef = doc(db, 'organization_members', `${program.organizationId}_${userId}`);
    await updateDoc(memberRef, {
      enrolledPrograms: arrayUnion(programId)
    });
  }
}

/**
 * Check if user is organization admin
 */
export async function isOrganizationAdmin(organizationId: string, userId: string): Promise<boolean> {
  const org = await getOrganization(organizationId);
  return org?.adminIds.includes(userId) ?? false;
}

/**
 * Get user's organization memberships
 */
export async function getUserMemberships(userId: string): Promise<OrganizationMember[]> {
  const db = getFirestore();
  const q = query(
    collection(db, 'organization_members'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      joinedAt: data.joinedAt.toDate(),
      lastActiveAt: data.lastActiveAt?.toDate()
    } as OrganizationMember;
  });
}

export default {
  createOrganization,
  getOrganization,
  getUserOrganizations,
  updateOrganization,
  addOrganizationMember,
  getOrganizationMembers,
  updateMemberRole,
  removeOrganizationMember,
  createProgram,
  getOrganizationPrograms,
  enrollUserInProgram,
  isOrganizationAdmin,
  getUserMemberships
};

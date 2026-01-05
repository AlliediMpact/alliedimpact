/**
 * Projects Service
 * Manages custom client projects, milestones, deliverables, and support tickets
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
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { logInfo, logError } from '@allied-impact/shared';

// ==================== ENUMS ====================

export enum ProjectStatus {
  DISCOVERY = 'discovery',
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum ProjectType {
  WEB_APP = 'web_app',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  WEBSITE = 'website',
  CUSTOM = 'custom',
  INTEGRATION = 'integration',
  MAINTENANCE = 'maintenance'
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  BLOCKED = 'blocked'
}

export enum DeliverableStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  APPROVED = 'approved',
  REVISION_REQUESTED = 'revision_requested'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// ==================== INTERFACES ====================

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  startDate: Date;
  endDate?: Date;
  estimatedBudget?: number;
  actualBudget?: number;
  currency: string;
  progress: number; // 0-100
  milestones: string[]; // milestone IDs
  deliverables: string[]; // deliverable IDs
  tickets: string[]; // ticket IDs
  teamMembers: string[]; // user IDs
  technologies?: string[];
  githubRepo?: string;
  productionUrl?: string;
  stagingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastActivityAt: Date;
  settings?: {
    allowTickets?: boolean;
    requireApprovals?: boolean;
    notifyOnUpdate?: boolean;
  };
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  dueDate: Date;
  completedDate?: Date;
  progress: number; // 0-100
  deliverables: string[]; // deliverable IDs
  dependencies?: string[]; // other milestone IDs
  assignedTo?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id: string;
  projectId: string;
  milestoneId?: string;
  name: string;
  description: string;
  type: string; // 'design', 'code', 'documentation', 'deployment', 'other'
  status: DeliverableStatus;
  dueDate: Date;
  deliveredDate?: Date;
  approvedDate?: Date;
  fileUrls?: string[];
  notes?: string;
  revisionNotes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  type: 'bug' | 'feature' | 'support' | 'question';
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  attachments?: string[];
  comments: TicketComment[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface TicketComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  attachments?: string[];
}

// ==================== PROJECT FUNCTIONS ====================

export async function createProject(
  clientId: string,
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>
): Promise<Project> {
  try {
    const db = getFirestore(getApp());
    const projectRef = doc(collection(db, 'projects'));
    
    const project: Project = {
      ...projectData,
      id: projectRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
    
    await setDoc(projectRef, {
      ...project,
      createdAt: Timestamp.fromDate(project.createdAt),
      updatedAt: Timestamp.fromDate(project.updatedAt),
      lastActivityAt: Timestamp.fromDate(project.lastActivityAt),
      startDate: Timestamp.fromDate(project.startDate),
      endDate: project.endDate ? Timestamp.fromDate(project.endDate) : null,
    });
    
    logInfo('Project created', { projectId: project.id, clientId });
    return project;
  } catch (error) {
    logError('Failed to create project', { error, clientId });
    throw error;
  }
}

export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const db = getFirestore(getApp());
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    
    if (!projectDoc.exists()) {
      return null;
    }
    
    const data = projectDoc.data();
    return {
      ...data,
      id: projectDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastActivityAt: data.lastActivityAt.toDate(),
      startDate: data.startDate.toDate(),
      endDate: data.endDate ? data.endDate.toDate() : undefined,
    } as Project;
  } catch (error) {
    logError('Failed to get project', { error, projectId });
    throw error;
  }
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
  try {
    const db = getFirestore(getApp());
    const projectsQuery = query(
      collection(db, 'projects'),
      where('clientId', '==', clientId),
      orderBy('lastActivityAt', 'desc')
    );
    
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        lastActivityAt: data.lastActivityAt.toDate(),
        startDate: data.startDate.toDate(),
        endDate: data.endDate ? data.endDate.toDate() : undefined,
      } as Project;
    });
  } catch (error) {
    logError('Failed to get client projects', { error, clientId });
    throw error;
  }
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
      lastActivityAt: Timestamp.now(),
    };
    
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }
    
    await updateDoc(doc(db, 'projects', projectId), updateData);
    logInfo('Project updated', { projectId });
  } catch (error) {
    logError('Failed to update project', { error, projectId });
    throw error;
  }
}

// ==================== MILESTONE FUNCTIONS ====================

export async function createMilestone(
  milestoneData: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Milestone> {
  try {
    const db = getFirestore(getApp());
    const milestoneRef = doc(collection(db, 'milestones'));
    
    const milestone: Milestone = {
      ...milestoneData,
      id: milestoneRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(milestoneRef, {
      ...milestone,
      createdAt: Timestamp.fromDate(milestone.createdAt),
      updatedAt: Timestamp.fromDate(milestone.updatedAt),
      dueDate: Timestamp.fromDate(milestone.dueDate),
      completedDate: milestone.completedDate ? Timestamp.fromDate(milestone.completedDate) : null,
    });
    
    // Add milestone to project
    const project = await getProject(milestoneData.projectId);
    if (project) {
      await updateProject(milestoneData.projectId, {
        milestones: [...project.milestones, milestone.id],
      });
    }
    
    logInfo('Milestone created', { milestoneId: milestone.id, projectId: milestoneData.projectId });
    return milestone;
  } catch (error) {
    logError('Failed to create milestone', { error });
    throw error;
  }
}

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  try {
    const db = getFirestore(getApp());
    const milestonesQuery = query(
      collection(db, 'milestones'),
      where('projectId', '==', projectId),
      orderBy('dueDate', 'asc')
    );
    
    const snapshot = await getDocs(milestonesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        dueDate: data.dueDate.toDate(),
        completedDate: data.completedDate ? data.completedDate.toDate() : undefined,
      } as Milestone;
    });
  } catch (error) {
    logError('Failed to get project milestones', { error, projectId });
    throw error;
  }
}

export async function updateMilestone(
  milestoneId: string,
  updates: Partial<Omit<Milestone, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.completedDate) {
      updateData.completedDate = Timestamp.fromDate(updates.completedDate);
    }
    
    await updateDoc(doc(db, 'milestones', milestoneId), updateData);
    logInfo('Milestone updated', { milestoneId });
  } catch (error) {
    logError('Failed to update milestone', { error, milestoneId });
    throw error;
  }
}

// ==================== DELIVERABLE FUNCTIONS ====================

export async function createDeliverable(
  deliverableData: Omit<Deliverable, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Deliverable> {
  try {
    const db = getFirestore(getApp());
    const deliverableRef = doc(collection(db, 'deliverables'));
    
    const deliverable: Deliverable = {
      ...deliverableData,
      id: deliverableRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(deliverableRef, {
      ...deliverable,
      createdAt: Timestamp.fromDate(deliverable.createdAt),
      updatedAt: Timestamp.fromDate(deliverable.updatedAt),
      dueDate: Timestamp.fromDate(deliverable.dueDate),
      deliveredDate: deliverable.deliveredDate ? Timestamp.fromDate(deliverable.deliveredDate) : null,
      approvedDate: deliverable.approvedDate ? Timestamp.fromDate(deliverable.approvedDate) : null,
    });
    
    // Add deliverable to project
    const project = await getProject(deliverableData.projectId);
    if (project) {
      await updateProject(deliverableData.projectId, {
        deliverables: [...project.deliverables, deliverable.id],
      });
    }
    
    logInfo('Deliverable created', { deliverableId: deliverable.id, projectId: deliverableData.projectId });
    return deliverable;
  } catch (error) {
    logError('Failed to create deliverable', { error });
    throw error;
  }
}

export async function getProjectDeliverables(projectId: string): Promise<Deliverable[]> {
  try {
    const db = getFirestore(getApp());
    const deliverablesQuery = query(
      collection(db, 'deliverables'),
      where('projectId', '==', projectId),
      orderBy('dueDate', 'asc')
    );
    
    const snapshot = await getDocs(deliverablesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        dueDate: data.dueDate.toDate(),
        deliveredDate: data.deliveredDate ? data.deliveredDate.toDate() : undefined,
        approvedDate: data.approvedDate ? data.approvedDate.toDate() : undefined,
      } as Deliverable;
    });
  } catch (error) {
    logError('Failed to get project deliverables', { error, projectId });
    throw error;
  }
}

// ==================== TICKET FUNCTIONS ====================

export async function createTicket(
  ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Ticket> {
  try {
    const db = getFirestore(getApp());
    const ticketRef = doc(collection(db, 'tickets'));
    
    const ticket: Ticket = {
      ...ticketData,
      id: ticketRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(ticketRef, {
      ...ticket,
      createdAt: Timestamp.fromDate(ticket.createdAt),
      updatedAt: Timestamp.fromDate(ticket.updatedAt),
      resolvedAt: ticket.resolvedAt ? Timestamp.fromDate(ticket.resolvedAt) : null,
      comments: ticket.comments.map(c => ({
        ...c,
        createdAt: Timestamp.fromDate(c.createdAt),
      })),
    });
    
    // Add ticket to project
    const project = await getProject(ticketData.projectId);
    if (project) {
      await updateProject(ticketData.projectId, {
        tickets: [...project.tickets, ticket.id],
      });
    }
    
    logInfo('Ticket created', { ticketId: ticket.id, projectId: ticketData.projectId });
    return ticket;
  } catch (error) {
    logError('Failed to create ticket', { error });
    throw error;
  }
}

export async function getProjectTickets(projectId: string): Promise<Ticket[]> {
  try {
    const db = getFirestore(getApp());
    const ticketsQuery = query(
      collection(db, 'tickets'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ticketsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        resolvedAt: data.resolvedAt ? data.resolvedAt.toDate() : undefined,
        comments: data.comments.map((c: any) => ({
          ...c,
          createdAt: c.createdAt.toDate(),
        })),
      } as Ticket;
    });
  } catch (error) {
    logError('Failed to get project tickets', { error, projectId });
    throw error;
  }
}

export async function addTicketComment(
  ticketId: string,
  comment: Omit<TicketComment, 'id' | 'createdAt'>
): Promise<void> {
  try {
    const db = getFirestore(getApp());
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketDoc = await getDoc(ticketRef);
    
    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }
    
    const data = ticketDoc.data();
    const newComment: TicketComment = {
      ...comment,
      id: `comment_${Date.now()}`,
      createdAt: new Date(),
    };
    
    await updateDoc(ticketRef, {
      comments: [
        ...data.comments.map((c: any) => ({
          ...c,
          createdAt: c.createdAt.toDate ? c.createdAt.toDate() : c.createdAt,
        })),
        newComment,
      ].map(c => ({
        ...c,
        createdAt: Timestamp.fromDate(c.createdAt),
      })),
      updatedAt: Timestamp.now(),
    });
    
    logInfo('Ticket comment added', { ticketId, commentId: newComment.id });
  } catch (error) {
    logError('Failed to add ticket comment', { error, ticketId });
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

export async function calculateProjectProgress(projectId: string): Promise<number> {
  try {
    const milestones = await getProjectMilestones(projectId);
    
    if (milestones.length === 0) {
      return 0;
    }
    
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / milestones.length);
  } catch (error) {
    logError('Failed to calculate project progress', { error, projectId });
    return 0;
  }
}

export function getProjectHealthStatus(project: Project): 'on-track' | 'at-risk' | 'delayed' {
  if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED) {
    return 'on-track';
  }
  
  const now = new Date();
  const daysRemaining = project.endDate 
    ? Math.ceil((project.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  if (daysRemaining !== null) {
    if (daysRemaining < 0) {
      return 'delayed';
    }
    
    const expectedProgress = project.endDate
      ? ((now.getTime() - project.startDate.getTime()) / (project.endDate.getTime() - project.startDate.getTime())) * 100
      : 0;
    
    if (project.progress < expectedProgress - 15) {
      return 'at-risk';
    }
  }
  
  return 'on-track';
}

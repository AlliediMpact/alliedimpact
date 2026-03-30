// @ts-ignore - Firebase admin/client SDK compatibility
import { db } from './firebase';
// @ts-ignore - Using admin SDK imports
import { Timestamp, collection, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { kycService } from './kyc-service';
import { transactionService } from './transaction-service';
import { adminAuth, adminDb } from './firebase-admin';
import { AuthEventType } from './auth-logger';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingKyc: number;
  totalTransactions: number;
  transactionVolume: number;
  disputeRate: number;
  avgResolutionTime: number;
  systemHealth: {
    errorRate: number;
    responseTime: number;
    uptime: number;
  };
}

interface AdminReport {
  id?: string;
  type: 'daily' | 'weekly' | 'monthly';
  metrics: SystemMetrics;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  createdAt: Timestamp;
}

interface UserListOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'fullName';
  sortDirection?: 'asc' | 'desc';
  filter?: {
    emailVerified?: boolean;
    membershipTier?: string;
    flagged?: boolean;
    loginIssues?: boolean;
  };
}

interface UserSecurityInfo {
  userId: string;
  email: string;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  securityEvents: Array<{
    eventType: string;
    timestamp: Date;
    metadata: any;
  }>;
  flagged: boolean;
  flagReason?: string;
  flaggedAt?: Date;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
}

export class AdminService {
  async getPendingKycVerifications() {
    const q = adminDb.collection('kyc_verifications').where('status', '==', 'pending_review');
    const snapshot = await q.get();
    return Promise.all(
      snapshot.docs.map(async (doc) => {
        // @ts-ignore - Type access on generic DocumentData
        const verification = { id: doc.id, ...doc.data() };
        // @ts-ignore - accessing userId property
        const documents = await kycService.getUserDocuments(verification.userId);
        return { ...verification, documents };
      })
    );
  }

  async getDisputeMetrics(startDate: Date, endDate: Date) {
    const q = adminDb.collection('disputes').where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    const snapshot = await q.get();
    const disputes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<any>;

    const totalDisputes = disputes.length;
    // @ts-ignore - Type access on generic DocumentData
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved');
    // Calculate average resolution time from Firestore Timestamps
    const avgResolutionTime = resolvedDisputes.length > 0 
      ? resolvedDisputes.reduce((acc: number, curr: any) => {
          const createdMs = (curr.createdAt?.toMillis?.() || new Date(curr.createdAt).getTime());
          const resolvedMs = (curr.resolvedAt?.toMillis?.() || new Date(curr.resolvedAt).getTime());
          return acc + (resolvedMs - createdMs);
        }, 0) / resolvedDisputes.length
      : 0;

    return {
      totalDisputes,
      resolvedDisputes: resolvedDisputes.length,
      avgResolutionTime,
      disputeRate: totalDisputes / await this.getTotalTrades(startDate, endDate)
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      users,
      activeUsers,
      pendingKyc,
      recentTransactions,
      disputes
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(dayAgo),
      this.getPendingKycCount(),
      this.getTransactions(monthAgo),
      this.getDisputeMetrics(monthAgo, now)
    ]);

    const transactionVolume = (recentTransactions as any[]).reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      totalUsers: users,
      activeUsers,
      pendingKyc,
      totalTransactions: recentTransactions.length,
      transactionVolume,
      disputeRate: disputes.disputeRate,
      avgResolutionTime: disputes.avgResolutionTime,
      systemHealth: await this.getSystemHealth()
    };
  }

  async generateReport(type: AdminReport['type']): Promise<AdminReport> {
    const now = new Date();
    let startDate: Date;

    switch (type) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const metrics = await this.getSystemMetrics();
    const report: Omit<AdminReport, 'id'> = {
      type,
      metrics,
      period: {
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(now)
      },
      createdAt: Timestamp.now()
    };

    // @ts-ignore - Firebase client/admin SDK compatibility
    const docRef = await collection(db, 'admin_reports').add(report);
    return { id: docRef.id, ...report };
  }

  private async getTotalUsers(): Promise<number> {
    // @ts-ignore - Firebase client/admin SDK compatibility
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.size;
  }

  private async getActiveUsers(since: Date): Promise<number> {
    // @ts-ignore - Firebase client/admin SDK compatibility
    const q = query(
      collection(db, 'user_activity'),
      where('lastActive', '>=', since)
    );
    // @ts-ignore - Firebase client/admin SDK compatibility
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  private async getPendingKycCount(): Promise<number> {
    // @ts-ignore - Firebase client/admin SDK compatibility
    const q = query(
      collection(db, 'kyc_verifications'),
      where('status', '==', 'pending_review')
    );
    // @ts-ignore - Firebase client/admin SDK compatibility
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  private async getTotalTrades(startDate: Date, endDate: Date): Promise<number> {
    // @ts-ignore - Firebase client/admin SDK compatibility
    const q = query(
      collection(db, 'trades'),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );
    // @ts-ignore - Firebase client/admin SDK compatibility
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  private async getTransactions(since: Date) {
    // @ts-ignore - Firebase client/admin SDK compatibility
    const q = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', since),
      orderBy('createdAt', 'desc')
    );
    // @ts-ignore - Firebase client/admin SDK compatibility
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private async getSystemHealth() {
    // @ts-ignore - Firebase client/admin SDK compatibility
    const q = query(
      collection(db, 'system_logs'),
      orderBy('timestamp', 'desc'),
      limit(1000) // Last 1000 requests
    );
    // @ts-ignore - Firebase client/admin SDK compatibility
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => doc.data());

    const errors = logs.filter(log => log.type === 'error');
    const responseTimes = logs.map(log => log.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    return {
      errorRate: errors.length / logs.length,
      responseTime: avgResponseTime,
      uptime: 0.999 // This should be fetched from a monitoring service
    };
  }

  /**
   * Get users with authentication-related information
   */
  async getUsers(options: UserListOptions = {}) {
    const {
      page = 1,
      limit: pageSize = 20,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      filter = {}
    } = options;
    
    try {
      // @ts-ignore - Firebase client/admin SDK compatibility
      let userQuery = collection(adminDb, 'users');
      
      // Apply filters if provided
      if (filter.emailVerified !== undefined) {
        // @ts-ignore - Firebase client/admin SDK compatibility
        userQuery = query(userQuery, where('emailVerified', '==', filter.emailVerified));
      }
      
      if (filter.membershipTier) {
        // @ts-ignore - Firebase client/admin SDK compatibility
        userQuery = query(userQuery, where('membershipTier', '==', filter.membershipTier));
      }
      
      if (filter.flagged) {
        // This requires a join-like operation with flagged_users collection
        // @ts-ignore - Firebase client/admin SDK compatibility
        const flaggedUsersSnapshot = await getDocs(collection(adminDb, 'flagged_users'));
        const flaggedUserIds = flaggedUsersSnapshot.docs.map(doc => doc.id);
        
        if (flaggedUserIds.length === 0) {
          return {
            users: [],
            total: 0,
            page,
            pageSize
          };
        }
        
        // @ts-ignore - Firebase client/admin SDK compatibility
        userQuery = query(userQuery, where('__name__', 'in', flaggedUserIds));
      }
      
      // Apply sorting
      // @ts-ignore - Firebase client/admin SDK compatibility
      userQuery = query(userQuery, orderBy(sortBy, sortDirection));
      
      // Apply pagination
      const startAt = (page - 1) * pageSize;
      // @ts-ignore - Firebase client/admin SDK compatibility
      userQuery = query(userQuery, limit(pageSize));
      
      // Execute the query
      // @ts-ignore - Firebase client/admin SDK compatibility
      const snapshot = await getDocs(userQuery);
      
      // Extract user data
      const users = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const userData = doc.data();
          
          // Get security info for each user
          const securityInfo = await this.getUserSecurityInfo(doc.id);
          
          return {
            id: doc.id,
            ...userData,
            ...securityInfo
          };
        })
      );
      
      // Get total count for pagination
      // @ts-ignore - Firebase client/admin SDK compatibility
      const totalSnapshot = await getDocs(collection(adminDb, 'users'));
      
      return {
        users,
        total: totalSnapshot.size,
        page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get detailed security information for a specific user
   */
  async getUserSecurityInfo(userId: string): Promise<UserSecurityInfo> {
    try {
      // Get user details from Auth
      const userRecord = await adminAuth.getUser(userId);
      
      // Get user data from Firestore
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      // Get security events
      const eventsQuery = adminDb.collection('authLogs').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(100);
      const eventsSnapshot = await eventsQuery.get();
      const securityEvents: Array<{ eventType: string; timestamp: Date; metadata: any }> = eventsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          eventType: data.eventType || 'unknown',
          timestamp: data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp),
          metadata: data.metadata || {}
        };
      });
      
      // Check if user is flagged
      const flaggedDoc = await adminDb.collection('flagged_users').doc(userId).get();
      const flagged = flaggedDoc.exists;
      const flagData = flagged ? flaggedDoc.data() : {};
      
      // Get failed login attempts count
      const failedLoginQuery = adminDb.collection('authLogs').where('userId', '==', userId).where('eventType', '==', AuthEventType.SIGN_IN_FAILURE).where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const failedLoginSnapshot = await failedLoginQuery.get();
      
      return {
        userId,
        email: userRecord.email || '',
        emailVerified: userRecord.emailVerified,
        lastLoginAt: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : null,
        createdAt: new Date(userRecord.metadata.creationTime || Date.now()),
        securityEvents,
        flagged,
        flagReason: flagData.reason,
        flaggedAt: flagData.flaggedAt instanceof Date ? flagData.flaggedAt : (flagData.flaggedAt?.toDate ? flagData.flaggedAt.toDate() : null),
        mfaEnabled: userRecord.multiFactor?.enrolledFactors?.length > 0 || false,
        failedLoginAttempts: failedLoginSnapshot.size
      };
    } catch (error) {
      console.error(`Error getting security info for user ${userId}:`, error);
      
      // Return minimal info in case of error
      return {
        userId,
        email: '',
        emailVerified: false,
        lastLoginAt: null,
        createdAt: new Date(),
        securityEvents: [],
        flagged: false,
        mfaEnabled: false,
        failedLoginAttempts: 0
      };
    }
  }

  /**
   * Flag a user account for security review
   */
  async flagUserAccount(userId: string, reason: string) {
    try {
      await adminDb.collection('flagged_users').doc(userId).set({
        reason,
        flaggedAt: new Date(),
        flaggedBy: 'admin', // This should be the admin's userId in production
        status: 'pending_review'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error flagging user account:', error);
      throw error;
    }
  }

  /**
   * Remove flag from a user account
   */
  async unflagUserAccount(userId: string) {
    try {
      await adminDb.collection('flagged_users').doc(userId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error unflagging user account:', error);
      throw error;
    }
  }

  /**
   * Disable a user account
   */
  async disableUserAccount(userId: string, reason: string) {
    try {
      // Disable in Firebase Auth
      await adminAuth.updateUser(userId, { disabled: true });
      
      // Record the action
      await adminDb.collection('admin_actions').add({
        action: 'disable_user',
        userId,
        reason,
        timestamp: new Date(),
        performedBy: 'admin' // This should be the admin's userId in production
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error disabling user account:', error);
      throw error;
    }
  }

  /**
   * Enable a user account
   */
  async enableUserAccount(userId: string) {
    try {
      // Enable in Firebase Auth
      await adminAuth.updateUser(userId, { disabled: false });
      
      // Record the action
      // @ts-ignore - Firebase client/admin SDK compatibility
      await adminDb.collection('admin_actions').add({
        action: 'enable_user',
        userId,
        timestamp: serverTimestamp(),
        performedBy: 'admin' // This should be the admin's userId in production
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error enabling user account:', error);
      throw error;
    }
  }

  /**
   * Get recent authentication events for monitoring
   */
  async getRecentAuthEvents(limitCount: number = 100) {
    try {
      const eventsQuery = adminDb.collection('authLogs').orderBy('timestamp', 'desc').limit(limitCount);
      const snapshot = await eventsQuery.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching recent auth events:', error);
      throw error;
    }
  }

  /**
   * Get security events that require admin review
   */
  async getSecurityEventsForReview() {
    try {
      const eventsQuery = adminDb.collection('securityEvents').where('reviewed', '==', false).orderBy('timestamp', 'desc');
      const snapshot = await eventsQuery.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching security events for review:', error);
      throw error;
    }
  }
  
  /**
   * Mark a security event as reviewed
   */
  async markSecurityEventReviewed(eventId: string, resolution: string) {
    try {
      await adminDb.collection('securityEvents').doc(eventId).update({
        reviewed: true,
        reviewedAt: new Date(),
        resolution,
        reviewedBy: 'admin' // This should be the admin's userId in production
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking security event as reviewed:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
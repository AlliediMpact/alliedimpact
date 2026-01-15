import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { DrivingSchool, Lead, AdSubscription, CommissionStatement } from './DrivingSchoolService';

export class AdminService {
  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const userRef = doc(db, 'drivemaster_users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    return userDoc.data().isAdmin === true;
  }

  /**
   * Get all schools (pending and approved)
   */
  async getAllSchools(): Promise<DrivingSchool[]> {
    const schoolsRef = collection(db, 'drivemaster_schools');
    const q = query(schoolsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        schoolId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as DrivingSchool;
    });
  }

  /**
   * Get pending school registrations
   */
  async getPendingSchools(): Promise<DrivingSchool[]> {
    const schoolsRef = collection(db, 'drivemaster_schools');
    const q = query(
      schoolsRef,
      where('isApproved', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        schoolId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as DrivingSchool;
    });
  }

  /**
   * Approve a school
   */
  async approveSchool(schoolId: string): Promise<void> {
    const schoolRef = doc(db, 'drivemaster_schools', schoolId);
    await updateDoc(schoolRef, {
      isApproved: true,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Reject/deactivate a school
   */
  async rejectSchool(schoolId: string, reason?: string): Promise<void> {
    const schoolRef = doc(db, 'drivemaster_schools', schoolId);
    await updateDoc(schoolRef, {
      isApproved: false,
      isActive: false,
      rejectionReason: reason || 'Not specified',
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Get all leads across all schools
   */
  async getAllLeads(): Promise<Lead[]> {
    const leadsRef = collection(db, 'drivemaster_leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        leadId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        confirmedAt: data.confirmedAt?.toDate(),
      } as Lead;
    });
  }

  /**
   * Get all subscriptions
   */
  async getAllSubscriptions(): Promise<AdSubscription[]> {
    const subscriptionsRef = collection(db, 'drivemaster_ad_subscriptions');
    const q = query(subscriptionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        subscriptionId: doc.id,
        ...data,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
      } as AdSubscription;
    });
  }

  /**
   * Get all commission statements
   */
  async getAllCommissionStatements(): Promise<CommissionStatement[]> {
    const statementsRef = collection(db, 'drivemaster_commission_statements');
    const q = query(statementsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        statementId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        paidAt: data.paidAt?.toDate(),
      } as CommissionStatement;
    });
  }

  /**
   * Mark commission statement as paid
   */
  async markCommissionAsPaid(
    statementId: string,
    paymentReference: string
  ): Promise<void> {
    const statementRef = doc(db, 'drivemaster_commission_statements', statementId);
    await updateDoc(statementRef, {
      isPaid: true,
      paidAt: Timestamp.fromDate(new Date()),
      paymentReference,
    });

    // Update individual leads
    const statement = await getDoc(statementRef);
    if (statement.exists()) {
      const data = statement.data();
      const leadsRef = collection(db, 'drivemaster_leads');
      const q = query(
        leadsRef,
        where('schoolId', '==', data.schoolId),
        where('status', '==', 'confirmed')
      );
      const snapshot = await getDocs(q);

      const updates = snapshot.docs.map((doc) => {
        return updateDoc(doc.ref, { commissionPaid: true });
      });

      await Promise.all(updates);
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalSchools: number;
    activeSchools: number;
    pendingSchools: number;
    totalLeads: number;
    confirmedLeads: number;
    pendingCommissions: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const [schools, leads, subscriptions, statements] = await Promise.all([
      this.getAllSchools(),
      this.getAllLeads(),
      this.getAllSubscriptions(),
      this.getAllCommissionStatements(),
    ]);

    const activeSchools = schools.filter((s) => s.isActive && s.isApproved).length;
    const pendingSchools = schools.filter((s) => !s.isApproved).length;
    const confirmedLeads = leads.filter((l) => l.status === 'confirmed').length;
    const pendingCommissions = statements
      .filter((s) => !s.isPaid)
      .reduce((sum, s) => sum + s.totalCommission, 0);

    // Calculate revenue from subscriptions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const monthlyRevenue = subscriptions
      .filter((sub) => {
        const subDate = sub.createdAt;
        return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
      })
      .reduce((sum, sub) => sum + sub.amount, 0);

    return {
      totalSchools: schools.length,
      activeSchools,
      pendingSchools,
      totalLeads: leads.length,
      confirmedLeads,
      pendingCommissions,
      totalRevenue,
      monthlyRevenue,
    };
  }

  /**
   * Generate commission statements for all schools with confirmed leads
   */
  async generateMonthlyStatements(month: string): Promise<number> {
    const schools = await this.getAllSchools();
    const [year, monthNum] = month.split('-').map(Number);

    let generatedCount = 0;

    for (const school of schools) {
      const leadsRef = collection(db, 'drivemaster_leads');
      const q = query(
        leadsRef,
        where('schoolId', '==', school.schoolId),
        where('status', '==', 'confirmed')
      );
      const snapshot = await getDocs(q);

      const monthLeads = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            ...data,
            leadId: doc.id,
            createdAt: data.createdAt?.toDate(),
            confirmedAt: data.confirmedAt?.toDate(),
          } as Lead;
        })
        .filter((lead) => {
          const leadDate = lead.confirmedAt || lead.createdAt;
          return leadDate.getFullYear() === year && leadDate.getMonth() + 1 === monthNum;
        });

      if (monthLeads.length > 0) {
        const totalCommission = monthLeads.reduce((sum, lead) => sum + lead.commissionAmount, 0);

        const statementsRef = collection(db, 'drivemaster_commission_statements');
        await addDoc(statementsRef, {
          schoolId: school.schoolId,
          month,
          totalLeads: monthLeads.length,
          confirmedLeads: monthLeads.length,
          totalCommission,
          isPaid: false,
          createdAt: Timestamp.fromDate(new Date()),
        });

        generatedCount++;
      }
    }

    return generatedCount;
  }

  /**
   * Get lead quality metrics
   */
  async getLeadQualityMetrics(): Promise<{
    averageConversionRate: number;
    leadsBySource: { [key: string]: number };
    topPerformingSchools: Array<{ schoolId: string; conversionRate: number; totalLeads: number }>;
  }> {
    const schools = await this.getAllSchools();
    const leads = await this.getAllLeads();

    // Conversion rate
    const confirmedCount = leads.filter((l) => l.status === 'confirmed').length;
    const averageConversionRate = leads.length > 0 ? (confirmedCount / leads.length) * 100 : 0;

    // Leads by source
    const leadsBySource: { [key: string]: number } = {};
    leads.forEach((lead) => {
      leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
    });

    // Top performing schools
    const schoolPerformance = schools.map((school) => {
      const schoolLeads = leads.filter((l) => l.schoolId === school.schoolId);
      const confirmed = schoolLeads.filter((l) => l.status === 'confirmed').length;
      const conversionRate = schoolLeads.length > 0 ? (confirmed / schoolLeads.length) * 100 : 0;

      return {
        schoolId: school.schoolId,
        schoolName: school.name,
        conversionRate,
        totalLeads: schoolLeads.length,
      };
    });

    const topPerformingSchools = schoolPerformance
      .filter((s) => s.totalLeads > 0)
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 10);

    return {
      averageConversionRate,
      leadsBySource,
      topPerformingSchools,
    };
  }
}

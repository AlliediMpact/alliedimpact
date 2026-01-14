import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type AdSubscriptionPlan = 'monthly_3' | 'annual';

export interface DrivingSchool {
  schoolId: string;
  name: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  regions: string[]; // e.g., ['Western Cape', 'Cape Town', 'Stellenbosch']
  address: string;
  ownerId: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdSubscription {
  subscriptionId: string;
  schoolId: string;
  plan: AdSubscriptionPlan;
  amount: number; // R499 or R999
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  paymentReference?: string;
  createdAt: Date;
}

export interface Lead {
  leadId: string;
  schoolId: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  learnerPhone: string;
  message: string;
  source: 'home_carousel' | 'discovery' | 'journey_complete';
  status: 'pending' | 'confirmed' | 'rejected';
  confirmedAt?: Date;
  commissionAmount: number; // 20% of subscription amount
  commissionPaid: boolean;
  createdAt: Date;
}

export interface CommissionStatement {
  statementId: string;
  schoolId: string;
  month: string; // 'YYYY-MM'
  totalLeads: number;
  confirmedLeads: number;
  totalCommission: number;
  isPaid: boolean;
  paidAt?: Date;
  paymentReference?: string;
  createdAt: Date;
}

const AD_PLANS = {
  monthly_3: {
    name: '3 Months',
    amount: 499,
    duration: 3 * 30, // days
    commission: 99.8, // 20% of R499
  },
  annual: {
    name: '12 Months',
    amount: 999,
    duration: 365, // days
    commission: 199.8, // 20% of R999
  },
};

export class DrivingSchoolService {
  /**
   * Create a new driving school profile
   */
  async createSchool(
    ownerId: string,
    schoolData: Omit<DrivingSchool, 'schoolId' | 'isActive' | 'isApproved' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const schoolsRef = collection(db, 'drivemaster_schools');
    const now = new Date();

    const docRef = await addDoc(schoolsRef, {
      ...schoolData,
      ownerId,
      isActive: false,
      isApproved: false, // Requires admin approval
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    return docRef.id;
  }

  /**
   * Get school by ID
   */
  async getSchool(schoolId: string): Promise<DrivingSchool | null> {
    const schoolRef = doc(db, 'drivemaster_schools', schoolId);
    const schoolDoc = await getDoc(schoolRef);

    if (!schoolDoc.exists()) {
      return null;
    }

    const data = schoolDoc.data();
    return {
      schoolId: schoolDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as DrivingSchool;
  }

  /**
   * Get schools by owner ID
   */
  async getSchoolsByOwner(ownerId: string): Promise<DrivingSchool[]> {
    const schoolsRef = collection(db, 'drivemaster_schools');
    const q = query(schoolsRef, where('ownerId', '==', ownerId));
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
   * Get active approved schools for ad display
   */
  async getActiveSchools(region?: string): Promise<DrivingSchool[]> {
    const schoolsRef = collection(db, 'drivemaster_schools');
    let q = query(
      schoolsRef,
      where('isActive', '==', true),
      where('isApproved', '==', true)
    );

    const snapshot = await getDocs(q);
    let schools = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        schoolId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as DrivingSchool;
    });

    // Filter by region if specified
    if (region) {
      schools = schools.filter((school) =>
        school.regions.some((r) => r.toLowerCase().includes(region.toLowerCase()))
      );
    }

    return schools;
  }

  /**
   * Create ad subscription
   */
  async createSubscription(
    schoolId: string,
    plan: AdSubscriptionPlan,
    paymentReference: string
  ): Promise<string> {
    const subscriptionsRef = collection(db, 'drivemaster_ad_subscriptions');
    const planDetails = AD_PLANS[plan];
    const now = new Date();
    const endDate = new Date(now.getTime() + planDetails.duration * 24 * 60 * 60 * 1000);

    const docRef = await addDoc(subscriptionsRef, {
      schoolId,
      plan,
      amount: planDetails.amount,
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(endDate),
      isActive: true,
      autoRenew: false,
      paymentReference,
      createdAt: Timestamp.fromDate(now),
    });

    // Activate school
    const schoolRef = doc(db, 'drivemaster_schools', schoolId);
    await updateDoc(schoolRef, {
      isActive: true,
      updatedAt: Timestamp.fromDate(now),
    });

    return docRef.id;
  }

  /**
   * Get active subscription for school
   */
  async getActiveSubscription(schoolId: string): Promise<AdSubscription | null> {
    const subscriptionsRef = collection(db, 'drivemaster_ad_subscriptions');
    const q = query(
      subscriptionsRef,
      where('schoolId', '==', schoolId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check if expired
    const endDate = data.endDate?.toDate();
    if (endDate && endDate < new Date()) {
      // Deactivate expired subscription
      await updateDoc(doc.ref, { isActive: false });
      
      // Deactivate school
      const schoolRef = doc.ref.parent.parent?.collection('drivemaster_schools').doc(schoolId);
      if (schoolRef) {
        await updateDoc(schoolRef, { isActive: false });
      }

      return null;
    }

    return {
      subscriptionId: doc.id,
      ...data,
      startDate: data.startDate?.toDate(),
      endDate: endDate,
      createdAt: data.createdAt?.toDate(),
    } as AdSubscription;
  }

  /**
   * Create a lead
   */
  async createLead(
    schoolId: string,
    learnerId: string,
    learnerData: { name: string; email: string; phone: string; message: string },
    source: Lead['source']
  ): Promise<string> {
    // Get school's current subscription to determine commission
    const subscription = await this.getActiveSubscription(schoolId);
    if (!subscription) {
      throw new Error('School does not have an active subscription');
    }

    const planDetails = AD_PLANS[subscription.plan];
    const leadsRef = collection(db, 'drivemaster_leads');
    const now = new Date();

    const docRef = await addDoc(leadsRef, {
      schoolId,
      learnerId,
      learnerName: learnerData.name,
      learnerEmail: learnerData.email,
      learnerPhone: learnerData.phone,
      message: learnerData.message,
      source,
      status: 'pending',
      commissionAmount: planDetails.commission,
      commissionPaid: false,
      createdAt: Timestamp.fromDate(now),
    });

    return docRef.id;
  }

  /**
   * Confirm a lead (by school owner)
   */
  async confirmLead(leadId: string): Promise<void> {
    const leadRef = doc(db, 'drivemaster_leads', leadId);
    await updateDoc(leadRef, {
      status: 'confirmed',
      confirmedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Get leads for a school
   */
  async getSchoolLeads(schoolId: string, status?: Lead['status']): Promise<Lead[]> {
    const leadsRef = collection(db, 'drivemaster_leads');
    let q = query(leadsRef, where('schoolId', '==', schoolId), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    let leads = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        leadId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        confirmedAt: data.confirmedAt?.toDate(),
      } as Lead;
    });

    if (status) {
      leads = leads.filter((lead) => lead.status === status);
    }

    return leads;
  }

  /**
   * Generate commission statement for a school
   */
  async generateCommissionStatement(schoolId: string, month: string): Promise<CommissionStatement> {
    const leads = await this.getSchoolLeads(schoolId, 'confirmed');

    // Filter leads for the specified month
    const [year, monthNum] = month.split('-').map(Number);
    const monthLeads = leads.filter((lead) => {
      const leadDate = lead.confirmedAt || lead.createdAt;
      return leadDate.getFullYear() === year && leadDate.getMonth() + 1 === monthNum;
    });

    const totalLeads = monthLeads.length;
    const totalCommission = monthLeads.reduce((sum, lead) => sum + lead.commissionAmount, 0);

    const statementsRef = collection(db, 'drivemaster_commission_statements');
    const now = new Date();

    const docRef = await addDoc(statementsRef, {
      schoolId,
      month,
      totalLeads,
      confirmedLeads: totalLeads,
      totalCommission,
      isPaid: false,
      createdAt: Timestamp.fromDate(now),
    });

    return {
      statementId: docRef.id,
      schoolId,
      month,
      totalLeads,
      confirmedLeads: totalLeads,
      totalCommission,
      isPaid: false,
      createdAt: now,
    };
  }

  /**
   * Get PayFast payment data for school subscription
   */
  getPayFastPaymentData(
    schoolId: string,
    plan: AdSubscriptionPlan,
    schoolEmail: string,
    returnUrl: string,
    cancelUrl: string,
    notifyUrl: string
  ) {
    const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '10000100';
    const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '46f0cd694581a';
    const planDetails = AD_PLANS[plan];
    const amount = planDetails.amount.toFixed(2);
    const itemName = `DriveMaster Ads - ${planDetails.name}`;

    return {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount,
      item_name: itemName,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      email_address: schoolEmail,
      m_payment_id: schoolId,
      amount_gross: amount,
      custom_str1: schoolId,
      custom_str2: plan,
    };
  }

  /**
   * Get subscription plans
   */
  getSubscriptionPlans() {
    return AD_PLANS;
  }
}

/**
 * @jest-environment jsdom
 */

import { DrivingSchoolService, type DrivingSchool, type AdSubscriptionPlan } from '@/lib/services/DrivingSchoolService';
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

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockTimestamp = Timestamp as jest.Mocked<typeof Timestamp>;

describe('DrivingSchoolService', () => {
  let service: DrivingSchoolService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DrivingSchoolService();

    // Mock Timestamp.fromDate
    mockTimestamp.fromDate = jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })) as any;

    mockCollection.mockReturnValue({} as any);
    mockQuery.mockReturnValue({} as any);
    mockWhere.mockReturnValue({} as any);
    mockOrderBy.mockReturnValue({} as any);
  });

  describe('createSchool', () => {
    it('should create a new school with correct defaults', async () => {
      const schoolData = {
        name: 'Test Driving School',
        description: 'Professional driving instruction',
        contactEmail: 'info@testschool.com',
        contactPhone: '+27123456789',
        regions: ['Western Cape', 'Cape Town'],
        address: '123 Main St, Cape Town',
        ownerId: 'owner-123',
      };

      mockAddDoc.mockResolvedValue({ id: 'school-123' } as any);

      const schoolId = await service.createSchool('owner-123', schoolData);

      expect(schoolId).toBe('school-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...schoolData,
          ownerId: 'owner-123',
          isActive: false,
          isApproved: false,
        })
      );
    });
  });

  describe('getSchool', () => {
    it('should return null if school not found', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await service.getSchool('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should return school data if found', async () => {
      const schoolData = {
        name: 'Test School',
        description: 'Test description',
        contactEmail: 'test@school.com',
        contactPhone: '+27123456789',
        regions: ['Western Cape'],
        address: '123 Main St',
        ownerId: 'owner-123',
        isActive: true,
        isApproved: true,
        createdAt: { toDate: () => new Date('2024-01-01') },
        updatedAt: { toDate: () => new Date('2024-01-02') },
      };

      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'school-123',
        data: () => schoolData,
      } as any);

      const result = await service.getSchool('school-123');

      expect(result).toBeDefined();
      expect(result?.schoolId).toBe('school-123');
      expect(result?.name).toBe('Test School');
      expect(result?.isActive).toBe(true);
    });
  });

  describe('getSchoolsByOwner', () => {
    it('should return schools owned by user', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            name: 'School 1',
            ownerId: 'owner-123',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'school-2',
          data: () => ({
            name: 'School 2',
            ownerId: 'owner-123',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: schools,
      } as any);

      const result = await service.getSchoolsByOwner('owner-123');

      expect(result).toHaveLength(2);
      expect(result[0].schoolId).toBe('school-1');
      expect(result[1].schoolId).toBe('school-2');
    });

    it('should return empty array if no schools found', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as any);

      const result = await service.getSchoolsByOwner('owner-123');

      expect(result).toEqual([]);
    });
  });

  describe('getActiveSchools', () => {
    it('should return only active and approved schools', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            name: 'Active School',
            isActive: true,
            isApproved: true,
            regions: ['Western Cape'],
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: schools,
      } as any);

      const result = await service.getActiveSchools();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Active School');
    });

    it('should filter by region when specified', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            name: 'Cape Town School',
            isActive: true,
            isApproved: true,
            regions: ['Western Cape', 'Cape Town'],
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'school-2',
          data: () => ({
            name: 'Johannesburg School',
            isActive: true,
            isApproved: true,
            regions: ['Gauteng', 'Johannesburg'],
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: schools,
      } as any);

      const result = await service.getActiveSchools('Cape Town');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cape Town School');
    });
  });

  describe('createSubscription', () => {
    it('should create subscription and activate school', async () => {
      mockAddDoc.mockResolvedValue({ id: 'sub-123' } as any);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      const subId = await service.createSubscription('school-123', 'monthly_3', 'PAY-123');

      expect(subId).toBe('sub-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          schoolId: 'school-123',
          plan: 'monthly_3',
          amount: 499,
          isActive: true,
          autoRenew: false,
          paymentReference: 'PAY-123',
        })
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isActive: true,
        })
      );
    });

    it('should create annual subscription with correct duration', async () => {
      mockAddDoc.mockResolvedValue({ id: 'sub-123' } as any);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.createSubscription('school-123', 'annual', 'PAY-456');

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          plan: 'annual',
          amount: 999,
        })
      );
    });
  });

  describe('getActiveSubscription', () => {
    it('should return null if no active subscription', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      const result = await service.getActiveSubscription('school-123');

      expect(result).toBeNull();
    });

    it('should return active subscription', async () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'sub-123',
            ref: {},
            data: () => ({
              schoolId: 'school-123',
              plan: 'monthly_3',
              amount: 499,
              isActive: true,
              startDate: { toDate: () => new Date() },
              endDate: { toDate: () => endDate },
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
      } as any);

      const result = await service.getActiveSubscription('school-123');

      expect(result).toBeDefined();
      expect(result?.plan).toBe('monthly_3');
      expect(result?.amount).toBe(499);
    });

    it('should deactivate expired subscription', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const mockDocRef = {
        ref: {
          parent: {
            parent: {
              collection: jest.fn(() => ({
                doc: jest.fn(() => ({})),
              })),
            },
          },
        },
      };

      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'sub-123',
            ...mockDocRef,
            data: () => ({
              schoolId: 'school-123',
              plan: 'monthly_3',
              isActive: true,
              endDate: { toDate: () => expiredDate },
            }),
          },
        ],
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined);

      const result = await service.getActiveSubscription('school-123');

      expect(result).toBeNull();
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('createLead', () => {
    it('should throw error if school has no active subscription', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      } as any);

      await expect(
        service.createLead('school-123', 'learner-123', {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+27123456789',
          message: 'I want lessons',
        }, 'home_carousel')
      ).rejects.toThrow('School does not have an active subscription');
    });

    it('should create lead with correct commission amount', async () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'sub-123',
            ref: {},
            data: () => ({
              schoolId: 'school-123',
              plan: 'monthly_3',
              endDate: { toDate: () => endDate },
            }),
          },
        ],
      } as any);

      mockAddDoc.mockResolvedValue({ id: 'lead-123' } as any);

      const leadId = await service.createLead('school-123', 'learner-123', {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+27123456789',
        message: 'I want lessons',
      }, 'journey_complete');

      expect(leadId).toBe('lead-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          schoolId: 'school-123',
          learnerId: 'learner-123',
          learnerName: 'John Doe',
          status: 'pending',
          commissionAmount: 99.8, // 20% of R499
          commissionPaid: false,
        })
      );
    });
  });

  describe('confirmLead', () => {
    it('should update lead status to confirmed', async () => {
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.confirmLead('lead-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'confirmed',
        })
      );
    });
  });

  describe('getSchoolLeads', () => {
    it('should return all leads for school', async () => {
      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            schoolId: 'school-123',
            learnerName: 'John Doe',
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'lead-2',
          data: () => ({
            schoolId: 'school-123',
            learnerName: 'Jane Smith',
            status: 'confirmed',
            createdAt: { toDate: () => new Date() },
            confirmedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: leads,
      } as any);

      const result = await service.getSchoolLeads('school-123');

      expect(result).toHaveLength(2);
    });

    it('should filter by status when provided', async () => {
      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            schoolId: 'school-123',
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'lead-2',
          data: () => ({
            schoolId: 'school-123',
            status: 'confirmed',
            createdAt: { toDate: () => new Date() },
            confirmedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: leads,
      } as any);

      const result = await service.getSchoolLeads('school-123', 'confirmed');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('confirmed');
    });
  });

  describe('generateCommissionStatement', () => {
    it('should calculate commission correctly', async () => {
      const confirmedDate = new Date('2024-01-15');
      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            schoolId: 'school-123',
            status: 'confirmed',
            commissionAmount: 99.8,
            createdAt: { toDate: () => confirmedDate },
            confirmedAt: { toDate: () => confirmedDate },
          }),
        },
        {
          id: 'lead-2',
          data: () => ({
            schoolId: 'school-123',
            status: 'confirmed',
            commissionAmount: 99.8,
            createdAt: { toDate: () => confirmedDate },
            confirmedAt: { toDate: () => confirmedDate },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: leads,
      } as any);

      mockAddDoc.mockResolvedValue({ id: 'statement-123' } as any);

      const result = await service.generateCommissionStatement('school-123', '2024-01');

      expect(result.totalLeads).toBe(2);
      expect(result.totalCommission).toBe(199.6);
      expect(result.isPaid).toBe(false);
    });
  });

  describe('getPayFastPaymentData', () => {
    it('should return correct payment data for monthly plan', () => {
      const data = service.getPayFastPaymentData(
        'school-123',
        'monthly_3',
        'school@example.com',
        'https://app.com/success',
        'https://app.com/cancel',
        'https://app.com/notify'
      );

      expect(data.amount).toBe('499.00');
      expect(data.item_name).toContain('3 Months');
      expect(data.email_address).toBe('school@example.com');
      expect(data.m_payment_id).toBe('school-123');
      expect(data.custom_str2).toBe('monthly_3');
    });

    it('should return correct payment data for annual plan', () => {
      const data = service.getPayFastPaymentData(
        'school-123',
        'annual',
        'school@example.com',
        'https://app.com/success',
        'https://app.com/cancel',
        'https://app.com/notify'
      );

      expect(data.amount).toBe('999.00');
      expect(data.item_name).toContain('12 Months');
    });
  });

  describe('getSubscriptionPlans', () => {
    it('should return all subscription plans', () => {
      const plans = service.getSubscriptionPlans();

      expect(plans.monthly_3).toBeDefined();
      expect(plans.annual).toBeDefined();
      expect(plans.monthly_3.amount).toBe(499);
      expect(plans.annual.amount).toBe(999);
    });
  });
});

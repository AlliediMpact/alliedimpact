/**
 * @jest-environment jsdom
 */

import { AdminService } from '@/lib/services/AdminService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
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
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockTimestamp = Timestamp as jest.Mocked<typeof Timestamp>;

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService();

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

  describe('isAdmin', () => {
    it('should return false if user not found', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await service.isAdmin('user-123');

      expect(result).toBe(false);
    });

    it('should return false if user is not admin', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ isAdmin: false }),
      } as any);

      const result = await service.isAdmin('user-123');

      expect(result).toBe(false);
    });

    it('should return true if user is admin', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ isAdmin: true }),
      } as any);

      const result = await service.isAdmin('admin-123');

      expect(result).toBe(true);
    });
  });

  describe('getAllSchools', () => {
    it('should return all schools ordered by creation date', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            name: 'School 1',
            isApproved: true,
            createdAt: { toDate: () => new Date('2024-01-01') },
            updatedAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
        {
          id: 'school-2',
          data: () => ({
            name: 'School 2',
            isApproved: false,
            createdAt: { toDate: () => new Date('2024-01-02') },
            updatedAt: { toDate: () => new Date('2024-01-02') },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: schools,
      } as any);

      const result = await service.getAllSchools();

      expect(result).toHaveLength(2);
      expect(result[0].schoolId).toBe('school-1');
    });
  });

  describe('getPendingSchools', () => {
    it('should return only unapproved schools', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            name: 'Pending School',
            isApproved: false,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: schools,
      } as any);

      const result = await service.getPendingSchools();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pending School');
    });
  });

  describe('approve School', () => {
    it('should set isApproved to true', async () => {
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.approveSchool('school-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isApproved: true,
        })
      );
    });
  });

  describe('rejectSchool', () => {
    it('should set isApproved and isActive to false', async () => {
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.rejectSchool('school-123', 'Invalid documents');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isApproved: false,
          isActive: false,
          rejectionReason: 'Invalid documents',
        })
      );
    });

    it('should use default reason if not provided', async () => {
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await service.rejectSchool('school-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          rejectionReason: 'Not specified',
        })
      );
    });
  });

  describe('getAllLeads', () => {
    it('should return all leads ordered by creation date', async () => {
      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            schoolId: 'school-1',
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'lead-2',
          data: () => ({
            schoolId: 'school-2',
            status: 'confirmed',
            createdAt: { toDate: () => new Date() },
            confirmedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: leads,
      } as any);

      const result = await service.getAllLeads();

      expect(result).toHaveLength(2);
    });
  });

  describe('getAllSubscriptions', () => {
    it('should return all subscriptions ordered by creation date', async () => {
      const subscriptions = [
        {
          id: 'sub-1',
          data: () => ({
            schoolId: 'school-1',
            plan: 'monthly_3',
            amount: 499,
            isActive: true,
            startDate: { toDate: () => new Date() },
            endDate: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: subscriptions,
      } as any);

      const result = await service.getAllSubscriptions();

      expect(result).toHaveLength(1);
      expect(result[0].plan).toBe('monthly_3');
    });
  });

  describe('getAllCommissionStatements', () => {
    it('should return all statements ordered by creation date', async () => {
      const statements = [
        {
          id: 'stmt-1',
          data: () => ({
            schoolId: 'school-1',
            month: '2024-01',
            totalCommission: 199.6,
            isPaid: false,
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: statements,
      } as any);

      const result = await service.getAllCommissionStatements();

      expect(result).toHaveLength(1);
      expect(result[0].totalCommission).toBe(199.6);
    });
  });

  describe('markCommissionAsPaid', () => {
    it('should update statement and related leads', async () => {
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ schoolId: 'school-123' }),
      } as any);

      const leads = [
        {
          ref: {},
          id: 'lead-1',
          data: () => ({}),
        },
        {
          ref: {},
          id: 'lead-2',
          data: () => ({}),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: leads,
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined);

      await service.markCommissionAsPaid('stmt-123', 'PAY-REF-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isPaid: true,
          paymentReference: 'PAY-REF-123',
        })
      );
      // Should update statement + 2 leads = 3 total calls
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
    });
  });

  describe('getDashboardStats', () => {
    it('should calculate statistics correctly', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            name: 'Active School',
            isActive: true,
            isApproved: true,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'school-2',
          data: () => ({
            name: 'Pending School',
            isActive: false,
            isApproved: false,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            status: 'confirmed',
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'lead-2',
          data: () => ({
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      const subscriptions = [
        {
          id: 'sub-1',
          data: () => ({
            amount: 499,
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      const statements = [
        {
          id: 'stmt-1',
          data: () => ({
            totalCommission: 99.8,
            isPaid: false,
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValueOnce({ docs: leads } as any)
        .mockResolvedValueOnce({ docs: subscriptions } as any)
        .mockResolvedValueOnce({ docs: statements } as any);

      const result = await service.getDashboardStats();

      expect(result.totalSchools).toBe(2);
      expect(result.activeSchools).toBe(1);
      expect(result.pendingSchools).toBe(1);
      expect(result.totalLeads).toBe(2);
      expect(result.confirmedLeads).toBe(1);
      expect(result.pendingCommissions).toBe(99.8);
      expect(result.totalRevenue).toBe(499);
      expect(result.monthlyRevenue).toBe(499);
    });
  });

  describe('generateMonthlyStatements', () => {
    it('should generate statements for schools with confirmed leads', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            schoolId: 'school-1',
            name: 'School 1',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            schoolId: 'school-1',
            status: 'confirmed',
            commissionAmount: 99.8,
            createdAt: { toDate: () => new Date('2024-01-15') },
            confirmedAt: { toDate: () => new Date('2024-01-15') },
          }),
        },
      ];

      mockGetDocs
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValue({ docs: leads } as any);

      mockAddDoc.mockResolvedValue({ id: 'stmt-123' } as any);

      const count = await service.generateMonthlyStatements('2024-01');

      expect(count).toBe(1);
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          schoolId: 'school-1',
          month: '2024-01',
          totalLeads: 1,
          totalCommission: 99.8,
        })
      );
    });

    it('should skip schools with no leads for the month', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            schoolId: 'school-1',
            name: 'School 1',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValue({ docs: [] } as any);

      const count = await service.generateMonthlyStatements('2024-01');

      expect(count).toBe(0);
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe('getLeadQualityMetrics', () => {
    it('should calculate correct metrics', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            schoolId: 'school-1',
            name: 'School 1',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      const leads = [
        {
          id: 'lead-1',
          data: () => ({
            schoolId: 'school-1',
            source: 'home_carousel',
            status: 'confirmed',
            createdAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'lead-2',
          data: () => ({
            schoolId: 'school-1',
            source: 'journey_complete',
            status: 'pending',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValueOnce({ docs: leads } as any)
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValueOnce({ docs: leads } as any);

      const result = await service.getLeadQualityMetrics();

      expect(result.averageConversionRate).toBe(50);
      expect(result.leadsBySource['home_carousel']).toBe(1);
      expect(result.leadsBySource['journey_complete']).toBe(1);
      expect(result.topPerformingSchools).toHaveLength(1);
      expect(result.topPerformingSchools[0].conversionRate).toBe(50);
    });

    it('should handle zero leads gracefully', async () => {
      const schools = [
        {
          id: 'school-1',
          data: () => ({
            schoolId: 'school-1',
            name: 'School 1',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockGetDocs
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValueOnce({ docs: [] } as any)
        .mockResolvedValueOnce({ docs: schools } as any)
        .mockResolvedValueOnce({ docs: [] } as any);

      const result = await service.getLeadQualityMetrics();

      expect(result.averageConversionRate).toBe(0);
      expect(result.topPerformingSchools).toHaveLength(0);
    });
  });
});

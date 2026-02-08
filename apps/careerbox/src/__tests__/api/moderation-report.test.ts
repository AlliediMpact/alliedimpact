import { POST } from '@/app/api/moderation/report/route';
import { NextRequest } from 'next/server';
import { reportContent } from '@/lib/moderation';

// Mock moderation service
jest.mock('@/lib/moderation', () => ({
  reportContent: jest.fn(),
}));

describe('POST /api/moderation/report', () => {
  const mockReportData = {
    contentType: 'listing',
    contentId: 'listing123',
    contentOwnerId: 'company456',
    reportedByUid: 'user789',
    reason: 'Inappropriate content',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Reports', () => {
    it('should report content successfully', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(mockReportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Content reported successfully. We will review it shortly.');
      expect(reportContent).toHaveBeenCalledWith(
        'listing',
        'listing123',
        'company456',
        'user789',
        'Inappropriate content'
      );
    });

    it('should pass all parameters to reportContent service', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(mockReportData),
      });

      await POST(request);

      expect(reportContent).toHaveBeenCalledWith(
        mockReportData.contentType,
        mockReportData.contentId,
        mockReportData.contentOwnerId,
        mockReportData.reportedByUid,
        mockReportData.reason
      );
    });

    it('should handle reporting of different content types', async () => {
      const contentTypes = ['listing', 'message', 'profile', 'comment'];

      for (const contentType of contentTypes) {
        (reportContent as jest.Mock).mockResolvedValue({ success: true });

        const request = new NextRequest('http://localhost/api/moderation/report', {
          method: 'POST',
          body: JSON.stringify({
            ...mockReportData,
            contentType,
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(reportContent).toHaveBeenCalledWith(
          contentType,
          expect.any(String),
          expect.any(String),
          expect.any(String),
          expect.any(String)
        );

        jest.clearAllMocks();
      }
    });
  });

  describe('Validation', () => {
    it('should return 400 if contentType is missing', async () => {
      const invalidData = { ...mockReportData };
      delete (invalidData as any).contentType;

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
      expect(reportContent).not.toHaveBeenCalled();
    });

    it('should return 400 if contentId is missing', async () => {
      const invalidData = { ...mockReportData };
      delete (invalidData as any).contentId;

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
      expect(reportContent).not.toHaveBeenCalled();
    });

    it('should return 400 if contentOwnerId is missing', async () => {
      const invalidData = { ...mockReportData };
      delete (invalidData as any).contentOwnerId;

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
      expect(reportContent).not.toHaveBeenCalled();
    });

    it('should return 400 if reportedByUid is missing', async () => {
      const invalidData = { ...mockReportData };
      delete (invalidData as any).reportedByUid;

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
      expect(reportContent).not.toHaveBeenCalled();
    });

    it('should return 400 if reason is missing', async () => {
      const invalidData = { ...mockReportData };
      delete (invalidData as any).reason;

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
      expect(reportContent).not.toHaveBeenCalled();
    });

    it('should return 400 if all required fields are missing', async () => {
      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
      expect(reportContent).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle moderation service failure', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: false });

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(mockReportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to report content');
    });

    it('should handle moderation service errors', async () => {
      (reportContent as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(mockReportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to report content');
    });

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to report content');
      expect(reportContent).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      (reportContent as jest.Mock).mockRejectedValue(new Error('Network timeout'));

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(mockReportData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to report content');
    });
  });

  describe('Report Reasons', () => {
    it('should accept spam reason', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          ...mockReportData,
          reason: 'Spam',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(reportContent).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        'Spam'
      );
    });

    it('should accept harassment reason', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          ...mockReportData,
          reason: 'Harassment',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept misleading information reason', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          ...mockReportData,
          reason: 'Misleading information',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept custom reason text', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const customReason = 'This listing contains discriminatory language';

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          ...mockReportData,
          reason: customReason,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(reportContent).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        customReason
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long reason text', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const longReason = 'a'.repeat(1000);

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          ...mockReportData,
          reason: longReason,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle special characters in reason', async () => {
      (reportContent as jest.Mock).mockResolvedValue({ success: true });

      const specialReason = 'Report: <script>alert("test")</script> & other %^& symbols';

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify({
          ...mockReportData,
          reason: specialReason,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle empty string fields (should fail validation)', async () => {
      const emptyData = {
        contentType: '',
        contentId: '',
        contentOwnerId: '',
        reportedByUid: '',
        reason: '',
      };

      const request = new NextRequest('http://localhost/api/moderation/report', {
        method: 'POST',
        body: JSON.stringify(emptyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters');
    });
  });
});

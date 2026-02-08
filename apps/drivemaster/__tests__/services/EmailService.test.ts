/**
 * @jest-environment jsdom
 */

import { EmailService, type EmailRecipient, type EmailAttachment } from '@/lib/services/EmailService';

// Mock fetch
global.fetch = jest.fn();

describe('EmailService', () => {
  let service: EmailService;
  const config = {
    apiKey: 'test-api-key',
    fromEmail: 'noreply@drivemaster.com',
    fromName: 'DriveMaster',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmailService(config);
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      const result = await service.sendEmail({
        to: { email: 'test@example.com', name: 'Test User' },
        subject: 'Test Subject',
        htmlContent: '<p>Test</p>',
      });

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should include text content when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>HTML</p>',
        textContent: 'Plain text',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.content).toEqual([
        { type: 'text/plain', value: 'Plain text' },
        { type: 'text/html', value: '<p>HTML</p>' },
      ]);
    });

    it('should strip HTML for text content when not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>Bold <strong>text</strong> here</p>',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.content[0].value).toBe('Bold text here');
    });

    it('should include attachments when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      const attachments: EmailAttachment[] = [
        {
          content: 'base64content',
          filename: 'test.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ];

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>Test</p>',
        attachments,
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.attachments).toEqual(attachments);
    });

    it('should return false on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>Test</p>',
      });

      expect(result).toBe(false);
    });

    it('should return false on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      const result = await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>Test</p>',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      const result = await service.sendWelcomeEmail(
        { email: 'user@example.com', name: 'John Doe' },
        'John'
      );

      expect(result).toBe(true);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.subject).toContain('Welcome');
      expect(body.personalizations[0].to[0].email).toBe('user@example.com');
    });
  });

  describe('HTML stripping', () => {
    it('should strip common HTML tags', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<div><h1>Title</h1><p>Paragraph with <a href="#">link</a></p></div>',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      const textContent = body.content[0].value;

      expect(textContent).not.toContain('<');
      expect(textContent).not.toContain('>');
      expect(textContent).toContain('Title');
      expect(textContent).toContain('Paragraph');
    });

    it('should decode HTML entities', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>&nbsp;&amp;&lt;&gt;</p>',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      const textContent = body.content[0].value;

      expect(textContent).toContain(' ');
      expect(textContent).toContain('&');
      expect(textContent).toContain('<');
      expect(textContent).toContain('>');
    });
  });

  describe('Email configuration', () => {
    it('should use correct from address', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>Test</p>',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.from).toEqual({
        email: 'noreply@drivemaster.com',
        name: 'DriveMaster',
      });
    });

    it('should use correct authorization header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 202,
      });

      await service.sendEmail({
        to: { email: 'test@example.com' },
        subject: 'Test',
        htmlContent: '<p>Test</p>',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];

      expect(callArgs.headers['Authorization']).toBe('Bearer test-api-key');
    });
  });
});

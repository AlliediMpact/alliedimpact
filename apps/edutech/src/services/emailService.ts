/**
 * Email Service for EduTech Notifications
 * 
 * Handles transactional emails via SendGrid (or substitute with your provider)
 * Documentation: https://docs.sendgrid.com/
 */

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  content: string; // Base64 encoded
  filename: string;
  type: string;
  disposition?: 'attachment' | 'inline';
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private baseUrl: string = 'https://api.sendgrid.com/v3/mail/send';

  constructor(config: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  }) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  /**
   * Send email via SendGrid API
   */
  async sendEmail(params: {
    to: EmailRecipient;
    subject: string;
    htmlContent: string;
    textContent?: string;
    attachments?: EmailAttachment[];
  }): Promise<boolean> {
    try {
      const payload = {
        personalizations: [
          {
            to: [{ email: params.to.email, name: params.to.name }],
          },
        ],
        from: { email: this.fromEmail, name: this.fromName },
        subject: params.subject,
        content: [
          { type: 'text/plain', value: params.textContent || this.stripHtml(params.htmlContent) },
          { type: 'text/html', value: params.htmlContent },
        ],
        attachments: params.attachments,
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  /**
   * Welcome Email
   */
  async sendWelcomeEmail(to: EmailRecipient, userName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to EduTech! 🎓',
      htmlContent: this.getWelcomeEmailTemplate(userName),
    });
  }

  /**
   * Trial Expiry Warning (7 days before)
   */
  async sendTrialExpiryWarning(to: EmailRecipient, userName: string, daysLeft: number): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Your EduTech trial ends in ${daysLeft} days`,
      htmlContent: this.getTrialExpiryTemplate(userName, daysLeft),
    });
  }

  /**
   * Trial Expired
   */
  async sendTrialExpiredEmail(to: EmailRecipient, userName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Your EduTech trial has ended',
      htmlContent: this.getTrialExpiredTemplate(userName),
    });
  }

  /**
   * Password Reset
   */
  async sendPasswordResetEmail(to: EmailRecipient, resetLink: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Reset your EduTech password',
      htmlContent: this.getPasswordResetTemplate(resetLink),
    });
  }

  /**
   * Course Enrollment Confirmation
   */
  async sendEnrollmentConfirmation(to: EmailRecipient, courseName: string, courseUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `You're enrolled in ${courseName}!`,
      htmlContent: this.getEnrollmentTemplate(courseName, courseUrl),
    });
  }

  /**
   * Course Completion Certificate
   */
  async sendCourseCertificate(
    to: EmailRecipient,
    courseName: string,
    certificatePdf: Buffer
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🎉 You completed ${courseName}!`,
      htmlContent: this.getCertificateTemplate(courseName),
      attachments: [
        {
          content: certificatePdf.toString('base64'),
          filename: `EduTech_Certificate_${courseName.replace(/\s+/g, '_')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });
  }

  /**
   * Payment Successful
   */
  async sendPaymentSuccess(to: EmailRecipient, amount: number, receiptUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Payment confirmed - EduTech',
      htmlContent: this.getPaymentSuccessTemplate(amount, receiptUrl),
    });
  }

  /**
   * Payment Failed
   */
  async sendPaymentFailed(to: EmailRecipient, amount: number, reason: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Payment issue - EduTech',
      htmlContent: this.getPaymentFailedTemplate(amount, reason),
    });
  }

  // ============================================
  // Email Templates (HTML)
  // ============================================

  private getWelcomeEmailTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to EduTech! 🎓</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>We're excited to have you join EduTech, South Africa's leading online learning platform!</p>
      
      <p><strong>Your 14-day free trial has started.</strong> During this time, you have full access to:</p>
      <ul>
        <li>All Computer Skills courses</li>
        <li>All Coding courses</li>
        <li>Progress tracking and certificates</li>
        <li>Interactive learning exercises</li>
        <li>Community forums</li>
      </ul>
      
      <p>Start learning today:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
      
      <p><strong>What's next?</strong></p>
      <ol>
        <li>Complete your profile</li>
        <li>Browse our course catalog</li>
        <li>Enroll in your first course</li>
        <li>Start learning!</li>
      </ol>
      
      <p>Need help? Reply to this email or visit our help center.</p>
      
      <p>Happy learning!<br>The EduTech Team</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} EduTech. All rights reserved.<br>
      Allied iMpact (Pty) Ltd | Durban, South Africa
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getTrialExpiryTemplate(userName: string, daysLeft: number): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your trial ends in ${daysLeft} days ⏰</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Your 14-day EduTech trial is coming to an end in <strong>${daysLeft} days</strong>.</p>
      
      <div class="highlight">
        <strong>Don't lose access to your progress!</strong><br>
        Subscribe now for just <strong>R199/month</strong> (or R1,999/year - save 16%).
      </div>
      
      <p><strong>What you'll keep:</strong></p>
      <ul>
        <li>All your course progress and certificates</li>
        <li>Access to new courses added monthly</li>
        <li>Unlimited learning at your own pace</li>
        <li>Community support and forums</li>
      </ul>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe" class="button">Subscribe Now</a>
      
      <p>Questions? We're here to help!</p>
      
      <p>Best regards,<br>The EduTech Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getTrialExpiredTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html>
<body>
  <h2>Your trial has ended</h2>
  <p>Hi ${userName},</p>
  <p>Your 14-day trial has ended. Subscribe to continue learning!</p>
  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe">Subscribe Now</a></p>
</body>
</html>
    `.trim();
  }

  private getPasswordResetTemplate(resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<body>
  <h2>Reset your password</h2>
  <p>Click the link below to reset your password:</p>
  <p><a href="${resetLink}">Reset Password</a></p>
  <p>This link expires in 1 hour.</p>
  <p>If you didn't request this, please ignore this email.</p>
</body>
</html>
    `.trim();
  }

  private getEnrollmentTemplate(courseName: string, courseUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<body>
  <h2>You're enrolled!</h2>
  <p>You've successfully enrolled in <strong>${courseName}</strong>.</p>
  <p><a href="${courseUrl}">Start Learning</a></p>
</body>
</html>
    `.trim();
  }

  private getCertificateTemplate(courseName: string): string {
    return `
<!DOCTYPE html>
<html>
<body>
  <h2>🎉 Congratulations!</h2>
  <p>You've completed <strong>${courseName}</strong>!</p>
  <p>Your certificate is attached to this email.</p>
  <p>Share your achievement on LinkedIn and keep learning!</p>
</body>
</html>
    `.trim();
  }

  private getPaymentSuccessTemplate(amount: number, receiptUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<body>
  <h2>Payment confirmed</h2>
  <p>Your payment of <strong>R${amount.toFixed(2)}</strong> was successful!</p>
  <p><a href="${receiptUrl}">View Receipt</a></p>
  <p>Thank you for subscribing to EduTech!</p>
</body>
</html>
    `.trim();
  }

  private getPaymentFailedTemplate(amount: number, reason: string): string {
    return `
<!DOCTYPE html>
<html>
<body>
  <h2>Payment issue</h2>
  <p>Your payment of <strong>R${amount.toFixed(2)}</strong> could not be processed.</p>
  <p><strong>Reason:</strong> ${reason}</p>
  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe">Try Again</a></p>
</body>
</html>
    `.trim();
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService({
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.EMAIL_FROM || 'noreply@edutech.co.za',
      fromName: 'EduTech',
    });
  }
  return emailService;
}

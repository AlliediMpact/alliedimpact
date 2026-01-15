/**
 * Email Service for DriveMaster Notifications
 * 
 * Handles transactional emails via SendGrid
 * Documentation: https://docs.sendgrid.com/
 */

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
   * Welcome Email (After registration)
   */
  async sendWelcomeEmail(to: EmailRecipient, userName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to DriveMaster! 🚗',
      htmlContent: this.getWelcomeEmailTemplate(userName),
    });
  }

  /**
   * Trial Expiry Warning
   */
  async sendTrialExpiryWarning(to: EmailRecipient, userName: string, daysLeft: number): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Your DriveMaster trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
      htmlContent: this.getTrialExpiryTemplate(userName, daysLeft),
    });
  }

  /**
   * Certificate Issued Notification (with PDF attachment)
   */
  async sendCertificateEmail(
    to: EmailRecipient,
    userName: string,
    stageName: string,
    certificatePdf: Buffer,
    certificateNumber: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🎉 You earned a K53 Certificate - ${stageName}!`,
      htmlContent: this.getCertificateTemplate(userName, stageName, certificateNumber),
      attachments: [
        {
          content: certificatePdf.toString('base64'),
          filename: `DriveMaster_Certificate_${certificateNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });
  }

  /**
   * Journey Completion Notification
   */
  async sendJourneyCompletionEmail(
    to: EmailRecipient,
    userName: string,
    journeyName: string,
    score: number
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🎊 Journey Complete: ${journeyName}!`,
      htmlContent: this.getJourneyCompletionTemplate(userName, journeyName, score),
    });
  }

  /**
   * Stage Mastery Achievement
   */
  async sendStageMasteryEmail(
    to: EmailRecipient,
    userName: string,
    stageName: string,
    nextStageName?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🏆 You mastered ${stageName}!`,
      htmlContent: this.getStageMasteryTemplate(userName, stageName, nextStageName),
    });
  }

  /**
   * Subscription Purchase Confirmation
   */
  async sendSubscriptionConfirmation(
    to: EmailRecipient,
    userName: string,
    tier: string,
    amount: number,
    reference: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Subscription Confirmed - DriveMaster',
      htmlContent: this.getSubscriptionConfirmationTemplate(userName, tier, amount, reference),
    });
  }

  /**
   * School Lead Notification (for school owners)
   */
  async sendSchoolLeadNotification(
    to: EmailRecipient,
    schoolName: string,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    message: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `New Student Inquiry - ${schoolName}`,
      htmlContent: this.getSchoolLeadTemplate(schoolName, studentName, studentEmail, studentPhone, message),
    });
  }

  /**
   * Commission Statement Ready (for school owners)
   */
  async sendCommissionStatementEmail(
    to: EmailRecipient,
    schoolName: string,
    month: string,
    amount: number,
    studentsCount: number
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Commission Statement - ${month}`,
      htmlContent: this.getCommissionStatementTemplate(schoolName, month, amount, studentsCount),
    });
  }

  // ============================================
  // Email Templates (HTML)
  // ============================================

  private getWelcomeEmailTemplate(userName: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
    .feature { background: #f0fdf4; padding: 15px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Welcome to DriveMaster!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Welcome to <strong>DriveMaster</strong> – South Africa's most engaging K53 learning platform!</p>
      
      <p><strong>Your 7-day free trial has started.</strong> You now have access to:</p>
      
      <div class="feature">
        <strong>🎮 Journey-Based Learning</strong><br>
        Master your K53 through progressive stages with increasing difficulty
      </div>
      
      <div class="feature">
        <strong>🏆 Achievements & Badges</strong><br>
        Earn credits, maintain streaks, and unlock badges as you learn
      </div>
      
      <div class="feature">
        <strong>📜 Official Certificates</strong><br>
        Get recognized for mastering each stage
      </div>
      
      <div class="feature">
        <strong>📱 Offline Support</strong><br>
        Study on-the-go without internet connection
      </div>
      
      <p>Ready to start your K53 mastery journey?</p>
      <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
      
      <p><strong>Quick Start Guide:</strong></p>
      <ol>
        <li>Complete your profile</li>
        <li>Start with Stage 1 journey</li>
        <li>Achieve 95% mastery to unlock Stage 2</li>
        <li>Keep going until you master all 5 stages!</li>
      </ol>
      
      <p>Remember: <strong>You need 15 credits</strong> to start a journey (earned daily or purchased).</p>
      
      <p>Need help? Reply to this email anytime!</p>
      
      <p>Happy learning!<br>The DriveMaster Team</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} DriveMaster. All rights reserved.<br>
      Allied iMpact (Pty) Ltd | Durban, South Africa
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getTrialExpiryTemplate(userName: string, daysLeft: number): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .highlight { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px; }
    .pricing { background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Your trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Your 7-day DriveMaster trial will end in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
      
      <div class="highlight">
        <strong>⚠️ Don't lose your progress!</strong><br>
        Subscribe now to keep learning and maintain your streak.
      </div>
      
      <div class="pricing">
        <h3 style="margin-top: 0; color: #10b981;">Choose Your Plan</h3>
        <p><strong>Monthly:</strong> R149/month</p>
        <p><strong>Quarterly:</strong> R349/3 months (save 22%)</p>
        <p><strong>Annual:</strong> R999/year (save 44%)</p>
      </div>
      
      <p><strong>With a subscription, you get:</strong></p>
      <ul>
        <li>✅ Unlimited journeys across all 5 stages</li>
        <li>✅ Unlimited credits (no daily limits)</li>
        <li>✅ All certificates and badges</li>
        <li>✅ Offline learning access</li>
        <li>✅ Priority support</li>
      </ul>
      
      <a href="${appUrl}/subscribe" class="button">Subscribe Now</a>
      
      <p>Questions? We're here to help!</p>
      
      <p>Best regards,<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getCertificateTemplate(userName: string, stageName: string, certificateNumber: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .certificate-info { background: #faf5ff; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
    .share-buttons { text-align: center; margin: 20px 0; }
    .share-button { display: inline-block; margin: 0 10px; padding: 10px 20px; text-decoration: none; border-radius: 5px; color: white; }
    .linkedin { background: #0077b5; }
    .twitter { background: #1da1f2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations ${userName}!</h1>
      <p style="font-size: 18px; margin: 10px 0;">You earned a certificate!</p>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>🏆 <strong>You've mastered ${stageName}!</strong></p>
      
      <div class="certificate-info">
        <h3 style="margin-top: 0; color: #8b5cf6;">Certificate Details</h3>
        <p><strong>Stage:</strong> ${stageName}</p>
        <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
        <p><strong>Issued:</strong> ${new Date().toLocaleDateString('en-ZA')}</p>
      </div>
      
      <p>Your official certificate is attached to this email as a PDF. You can also:</p>
      <ul>
        <li>📥 Download it from your dashboard</li>
        <li>🔗 Share the verification link</li>
        <li>🖨️ Print it for your records</li>
      </ul>
      
      <a href="${appUrl}/certificates" class="button">View All Certificates</a>
      
      <div class="share-buttons">
        <p><strong>Share your achievement:</strong></p>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}/verify/${certificateNumber}" class="share-button linkedin">Share on LinkedIn</a>
        <a href="https://twitter.com/intent/tweet?text=I%20just%20earned%20a%20certificate%20for%20${encodeURIComponent(stageName)}%20on%20DriveMaster!&url=${appUrl}/verify/${certificateNumber}" class="share-button twitter">Share on Twitter</a>
      </div>
      
      <p>Keep up the great work! 🚗💨</p>
      
      <p>Best regards,<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getJourneyCompletionTemplate(userName: string, journeyName: string, score: number): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    const isPassed = score >= 95;
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${isPassed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f59e0b'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .score-box { background: ${isPassed ? '#f0fdf4' : '#fef3c7'}; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
    .score { font-size: 48px; font-weight: bold; color: ${isPassed ? '#10b981' : '#f59e0b'}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isPassed ? '🎊 Journey Complete!' : '⭐ Journey Completed'}</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>You've completed the journey: <strong>${journeyName}</strong></p>
      
      <div class="score-box">
        <div class="score">${score}%</div>
        <p style="margin: 10px 0;">${isPassed ? '✅ Passed!' : 'Keep practicing!'}</p>
      </div>
      
      ${isPassed ? `
        <p>🎉 <strong>Congratulations!</strong> You've achieved mastery with ${score}% accuracy!</p>
        <p>Your progress has been saved and you're one step closer to your K53 license.</p>
      ` : `
        <p>You scored ${score}%. Keep practicing to reach 95% mastery and unlock the next stage!</p>
        <p><strong>Tip:</strong> Review the questions you missed and try the journey again.</p>
      `}
      
      <a href="${appUrl}/dashboard" class="button">View Dashboard</a>
      
      <p>Keep learning!<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getStageMasteryTemplate(userName: string, stageName: string, nextStageName?: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .trophy { font-size: 64px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Stage Mastered!</h1>
    </div>
    <div class="content">
      <div class="trophy">🏆</div>
      
      <p>Hi ${userName},</p>
      
      <p><strong>Amazing work!</strong> You've officially mastered <strong>${stageName}</strong>!</p>
      
      <p>This means you've demonstrated consistent proficiency and are ready to move forward.</p>
      
      ${nextStageName ? `
        <p>🎯 <strong>Next Challenge:</strong> ${nextStageName} is now unlocked!</p>
        <p>Continue your journey to master all stages and become a K53 expert.</p>
        <a href="${appUrl}/dashboard" class="button">Start ${nextStageName}</a>
      ` : `
        <p>🎓 <strong>You've completed all stages!</strong></p>
        <p>You're now a certified K53 master. Keep practicing to maintain your skills!</p>
        <a href="${appUrl}/certificates" class="button">View Certificates</a>
      `}
      
      <p>Keep up the excellent work!<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getSubscriptionConfirmationTemplate(userName: string, tier: string, amount: number, reference: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .receipt { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Subscription Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Thank you for subscribing to DriveMaster! Your payment has been successfully processed.</p>
      
      <div class="receipt">
        <h3 style="margin-top: 0;">Payment Receipt</h3>
        <div class="receipt-row">
          <span><strong>Plan:</strong></span>
          <span>${tier}</span>
        </div>
        <div class="receipt-row">
          <span><strong>Amount:</strong></span>
          <span>R${amount.toFixed(2)}</span>
        </div>
        <div class="receipt-row">
          <span><strong>Reference:</strong></span>
          <span>${reference}</span>
        </div>
        <div class="receipt-row">
          <span><strong>Date:</strong></span>
          <span>${new Date().toLocaleDateString('en-ZA')}</span>
        </div>
      </div>
      
      <p><strong>What's included:</strong></p>
      <ul>
        <li>✅ Unlimited journeys across all stages</li>
        <li>✅ Unlimited credits (no daily wait)</li>
        <li>✅ All certificates and badges</li>
        <li>✅ Offline learning access</li>
        <li>✅ Priority support</li>
      </ul>
      
      <a href="${appUrl}/dashboard" class="button">Start Learning</a>
      
      <p><small>Need help? Reply to this email or contact support.</small></p>
      
      <p>Happy learning!<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getSchoolLeadTemplate(
    schoolName: string,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    message: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .student-info { background: #eff6ff; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .info-row { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📩 New Student Inquiry</h1>
    </div>
    <div class="content">
      <p>Hello ${schoolName},</p>
      
      <p>You have a new student inquiry from DriveMaster!</p>
      
      <div class="student-info">
        <h3 style="margin-top: 0;">Student Details</h3>
        <div class="info-row"><strong>Name:</strong> ${studentName}</div>
        <div class="info-row"><strong>Email:</strong> <a href="mailto:${studentEmail}">${studentEmail}</a></div>
        <div class="info-row"><strong>Phone:</strong> <a href="tel:${studentPhone}">${studentPhone}</a></div>
        <div class="info-row"><strong>Message:</strong></div>
        <p style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">${message}</p>
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Contact the student within 24 hours for best conversion</li>
        <li>Discuss their learning goals and schedule</li>
        <li>Offer your school's packages and pricing</li>
      </ol>
      
      <p><strong>Commission Reminder:</strong> You earn 20% commission on any subscriptions from students you refer!</p>
      
      <p>Good luck!<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getCommissionStatementTemplate(
    schoolName: string,
    month: string,
    amount: number,
    studentsCount: number
  ): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivemaster.co.za';
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .statement { background: #f0fdf4; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
    .amount { font-size: 36px; font-weight: bold; color: #10b981; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Commission Statement - ${month}</h1>
    </div>
    <div class="content">
      <p>Hello ${schoolName},</p>
      
      <p>Your monthly commission statement is ready!</p>
      
      <div class="statement">
        <h3 style="margin-top: 0;">Total Commission Earned</h3>
        <div class="amount">R${amount.toFixed(2)}</div>
        <p style="color: #6b7280;">Based on ${studentsCount} active student${studentsCount !== 1 ? 's' : ''}</p>
      </div>
      
      <p><strong>Payment Details:</strong></p>
      <ul>
        <li>Payment will be processed within 5 business days</li>
        <li>Funds will be deposited to your registered bank account</li>
        <li>You'll receive a confirmation email once processed</li>
      </ul>
      
      <a href="${appUrl}/school/dashboard" class="button">View Full Statement</a>
      
      <p>Thank you for being a valued DriveMaster partner!</p>
      
      <p>Best regards,<br>The DriveMaster Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.NEXT_PUBLIC_SENDGRID_API_KEY || '';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@drivemaster.co.za';
    const fromName = 'DriveMaster';

    if (!apiKey) {
      console.warn('⚠️ SendGrid API key not configured. Email notifications will not be sent.');
    }

    emailService = new EmailService({
      apiKey,
      fromEmail,
      fromName,
    });
  }
  return emailService;
}

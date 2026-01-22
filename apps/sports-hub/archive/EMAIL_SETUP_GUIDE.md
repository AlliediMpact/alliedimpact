# 📧 Email Notification System Setup

**Version**: 1.0.0  
**Last Updated**: January 21, 2026  
**Status**: Implementation Guide

This guide explains how to add email notifications to SportsHub using SendGrid.

---

## 📋 Overview

Currently, SportsHub has:
- ✅ In-app notifications (toast, bell, realtime)
- ✅ Notification templates
- ✅ Database structure ready

**Missing**: Email delivery service integration

---

## 1️⃣ Choose Email Service

### Recommended: SendGrid

**Why SendGrid**:
- 100 emails/day free tier
- Reliable delivery (99.9% uptime)
- Easy API integration
- Template system
- Analytics and tracking
- South African data center available

**Alternatives**:
- Mailgun (99 emails/month free)
- AWS SES (requires AWS setup)
- Postmark (100 emails/month free)

---

## 2️⃣ SendGrid Setup

### Step 1: Create Account

1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for free account
3. Verify email address
4. Complete sender authentication

### Step 2: Get API Key

1. Navigate to Settings → API Keys
2. Click "Create API Key"
3. Name: "SportsHub Production"
4. Permission: "Full Access"
5. **Copy API key** (shown once only!)

### Step 3: Verify Domain (Optional but Recommended)

1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow DNS configuration steps
4. Wait for verification (24-48 hours)

**Benefits**:
- Better deliverability
- Professional appearance
- No "via sendgrid.net" warning

---

## 3️⃣ Implementation

### Step 1: Install Dependencies

```bash
cd apps/sports-hub
pnpm add @sendgrid/mail
pnpm add -D @types/sendgrid__mail
```

### Step 2: Configure Environment

Add to `.env.local`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@sportshub.alliedimpact.com
SENDGRID_FROM_NAME=SportsHub
```

### Step 3: Create Email Service

Create `src/lib/email.ts`:

```typescript
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
} else {
  console.warn('SendGrid API key not configured - emails will not be sent');
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@sportshub.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'SportsHub';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Send email via SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!apiKey) {
    console.warn('Email not sent: SendGrid not configured');
    return false;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    return false;
  }
}

/**
 * Email Templates
 */
export const EmailTemplates = {
  /**
   * Vote confirmation email
   */
  voteConfirmation: (params: {
    userName: string;
    tournamentName: string;
    optionSelected: string;
    voteCount: number;
    amountDeducted: string;
    remainingBalance: string;
  }) => ({
    subject: `Vote Confirmed - ${params.tournamentName}`,
    text: `
Hi ${params.userName},

Your vote has been successfully recorded!

Tournament: ${params.tournamentName}
Your Choice: ${params.optionSelected}
Votes Cast: ${params.voteCount}
Amount Deducted: ${params.amountDeducted}
Remaining Balance: ${params.remainingBalance}

Thank you for participating!

Best regards,
SportsHub Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .detail-value { color: #111827; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚽ Vote Confirmed!</h1>
      <p><span class="success-badge">✓ Successful</span></p>
    </div>
    <div class="content">
      <p>Hi <strong>${params.userName}</strong>,</p>
      <p>Your vote has been successfully recorded for:</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Tournament</span>
          <span class="detail-value">${params.tournamentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Your Choice</span>
          <span class="detail-value">${params.optionSelected}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Votes Cast</span>
          <span class="detail-value">${params.voteCount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Deducted</span>
          <span class="detail-value">${params.amountDeducted}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Remaining Balance</span>
          <span class="detail-value">${params.remainingBalance}</span>
        </div>
      </div>
      
      <p>Thank you for participating in SportsHub!</p>
      <p>View live results at: <a href="https://sportshub.alliedimpact.com">sportshub.alliedimpact.com</a></p>
    </div>
    <div class="footer">
      <p>© 2026 SportsHub. All rights reserved.</p>
      <p>You received this email because you cast a vote on SportsHub.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  /**
   * Wallet top-up confirmation
   */
  walletTopUp: (params: {
    userName: string;
    amount: string;
    newBalance: string;
    transactionId: string;
  }) => ({
    subject: 'Wallet Top-Up Successful',
    text: `
Hi ${params.userName},

Your wallet has been topped up successfully!

Amount Added: ${params.amount}
New Balance: ${params.newBalance}
Transaction ID: ${params.transactionId}

You can now use your credits to vote in tournaments.

Best regards,
SportsHub Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .amount { font-size: 36px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Top-Up Successful!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${params.userName}</strong>,</p>
      <p>Your wallet has been topped up successfully:</p>
      
      <div class="amount">+${params.amount}</div>
      
      <div class="details">
        <div class="detail-row">
          <span>New Balance</span>
          <span><strong>${params.newBalance}</strong></span>
        </div>
        <div class="detail-row">
          <span>Transaction ID</span>
          <span>${params.transactionId}</span>
        </div>
      </div>
      
      <p>You can now use your credits to vote in tournaments!</p>
      <p><a href="https://sportshub.alliedimpact.com/tournaments">Browse Tournaments →</a></p>
    </div>
    <div class="footer">
      <p>© 2026 SportsHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),

  /**
   * Tournament published notification
   */
  tournamentPublished: (params: {
    userName: string;
    tournamentName: string;
    description: string;
    deadline: string;
    tournamentUrl: string;
  }) => ({
    subject: `New Tournament: ${params.tournamentName}`,
    text: `
Hi ${params.userName},

A new tournament has been published!

${params.tournamentName}
${params.description}

Voting closes: ${params.deadline}

Cast your vote now: ${params.tournamentUrl}

Best regards,
SportsHub Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .tournament { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .cta { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 New Tournament Live!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${params.userName}</strong>,</p>
      <p>A new tournament has just been published:</p>
      
      <div class="tournament">
        <h2>${params.tournamentName}</h2>
        <p>${params.description}</p>
        <p><strong>Voting closes:</strong> ${params.deadline}</p>
      </div>
      
      <center>
        <a href="${params.tournamentUrl}" class="cta">Cast Your Vote →</a>
      </center>
      
      <p>Don't miss out on this exciting tournament!</p>
    </div>
    <div class="footer">
      <p>© 2026 SportsHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  }),
};

/**
 * Send vote confirmation email
 */
export async function sendVoteConfirmationEmail(
  userEmail: string,
  params: Parameters<typeof EmailTemplates.voteConfirmation>[0]
): Promise<boolean> {
  const template = EmailTemplates.voteConfirmation(params);
  return sendEmail({
    to: userEmail,
    ...template,
  });
}

/**
 * Send wallet top-up email
 */
export async function sendWalletTopUpEmail(
  userEmail: string,
  params: Parameters<typeof EmailTemplates.walletTopUp>[0]
): Promise<boolean> {
  const template = EmailTemplates.walletTopUp(params);
  return sendEmail({
    to: userEmail,
    ...template,
  });
}

/**
 * Send tournament published email
 */
export async function sendTournamentPublishedEmail(
  userEmail: string,
  params: Parameters<typeof EmailTemplates.tournamentPublished>[0]
): Promise<boolean> {
  const template = EmailTemplates.tournamentPublished(params);
  return sendEmail({
    to: userEmail,
    ...template,
  });
}
```

### Step 4: Integrate with Cloud Functions

Update `functions/src/index.ts`:

```typescript
import { sendVoteConfirmationEmail } from './email';

// In deductVoteFromWallet function, after successful vote:
const voteResult = await voteTransaction();

// Send email notification
if (userEmail) {
  await sendVoteConfirmationEmail(userEmail, {
    userName: userData.displayName,
    tournamentName: tournament.name,
    optionSelected: selectedOption.label,
    voteCount: 1,
    amountDeducted: 'R2.00',
    remainingBalance: formatCurrency(newBalance),
  }).catch(error => {
    console.error('Email send failed (non-critical):', error);
  });
}
```

---

## 4️⃣ Testing

### Test Email Locally

Create `scripts/test-email.js`:

```javascript
require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'your-email@example.com',
  from: {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: 'SportsHub',
  },
  subject: 'Test Email from SportsHub',
  text: 'This is a test email',
  html: '<strong>This is a test email</strong>',
};

sgMail.send(msg)
  .then(() => console.log('✅ Email sent successfully'))
  .catch(error => console.error('❌ Error:', error));
```

Run:
```bash
node scripts/test-email.js
```

---

## 5️⃣ Production Checklist

- [ ] SendGrid account created
- [ ] API key generated and secured
- [ ] Domain authenticated (optional)
- [ ] From email configured
- [ ] Templates created and tested
- [ ] Email service integrated with Cloud Functions
- [ ] Test emails sent successfully
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Unsubscribe link added (if sending promotional emails)

---

## 6️⃣ Best Practices

### ✅ DO:
- ✅ Keep emails transactional (no marketing)
- ✅ Include plain text version
- ✅ Test on multiple email clients
- ✅ Handle SendGrid errors gracefully
- ✅ Log all email attempts
- ✅ Respect user preferences

### ❌ DON'T:
- ❌ Send emails synchronously (use background jobs)
- ❌ Expose API key in client code
- ❌ Send excessive emails (rate limit)
- ❌ Hard-code email content
- ❌ Ignore bounce notifications

---

## 7️⃣ Monitoring

Track these metrics:

```javascript
{
  emails_sent: count,
  emails_delivered: count,
  emails_bounced: count,
  emails_opened: count,
  emails_clicked: count,
  send_failures: count
}
```

View in SendGrid Dashboard:
1. Navigate to Stats
2. Select date range
3. Review delivery metrics

---

## ✅ Complete!

Email notifications are now set up! Users will receive:
- ✅ Vote confirmations
- ✅ Wallet top-up receipts
- ✅ Tournament announcements

🎉

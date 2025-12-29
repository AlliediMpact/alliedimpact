# Bulk Operations User Guide
## Coin Box Platform - Phase 7 Feature

**Version:** 1.0  
**Date:** December 17, 2025  
**Feature Status:** ✅ Production Ready

---

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Feature Overview](#feature-overview)
4. [Bulk Loan Creation](#bulk-loan-creation)
5. [Bulk Investments](#bulk-investments)
6. [Bulk Crypto Orders](#bulk-crypto-orders)
7. [Bulk Messaging](#bulk-messaging)
8. [Data Export](#data-export)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Introduction

The Bulk Operations feature allows you to perform multiple operations simultaneously, saving time and improving efficiency. Whether you're creating multiple loan tickets, processing investments, or exporting data, our bulk tools streamline your workflow.

### Key Benefits
- ⚡ **Save Time:** Process up to 20-50 operations at once
- 📊 **Better Organization:** Batch tracking with unique IDs
- 🔍 **Full Transparency:** Per-item status and error reporting
- 📁 **Easy Data Management:** CSV import/export support
- 🔐 **Audit Trail:** All operations are logged

---

## Getting Started

### Accessing Bulk Operations

1. **Navigate to Bulk Operations:**
   - Go to: `/bulk-operations`
   - Or find it in the main navigation menu

2. **Dashboard Overview:**
   - View all available bulk features
   - Check your operation statistics
   - Access security and compliance information

3. **Select Your Operation:**
   - Use the tab menu to choose:
     - **Loans** - Create multiple loan tickets
     - **Investments** - Process multiple investments
     - **Crypto** - Create crypto orders
     - **Messages** - Send bulk messages (Admin only)
     - **Export** - Export your data

---

## Feature Overview

### Available Operations

| Operation | Max Batch Size | Who Can Use | Processing Time |
|-----------|---------------|-------------|-----------------|
| Bulk Loans | 20 loans | All users | ~2-3 seconds |
| Bulk Investments | 20 investments | All users | ~3-5 seconds |
| Bulk Crypto Orders | 20 orders | All users | ~2-3 seconds |
| Bulk Messages | 50 recipients | Admin/Support | ~5-7 seconds |
| Data Export | 10,000 records | All users | ~5-10 seconds |

### Batch Tracking

Every batch operation receives a unique ID in the format:
```
bulk_{type}_{timestamp}_{userId}
```

Example: `bulk_loans_1734451200000_abc123`

This ID can be used to:
- Track operation status
- Review batch results
- Access audit logs
- Generate reports

---

## Bulk Loan Creation

### Overview
Create multiple loan tickets at once with interest rates between 15% and 25%.

### Step-by-Step Guide

#### Method 1: Manual Entry

1. **Navigate to Loans Tab**
   - Click on "Loans" in the tab menu

2. **Enter Loan Details:**
   - **Amount:** Enter loan amount in FCFA
   - **Duration:** Select from 30, 60, 90, 180, or 360 days
   - **Interest Rate:** Enter rate between 15% and 25%

3. **Add More Loans:**
   - Click "Add Loan" to create more rows (max 20)
   - Click the trash icon to remove a loan

4. **Review Totals:**
   - Check total loan amount
   - Review average interest rate
   - Verify loan count

5. **Submit:**
   - Click "Create X Loans" button
   - Wait for processing
   - Review results

#### Method 2: CSV Upload

1. **Download Template:**
   - Click "Download Template" button
   - Open in Excel or Google Sheets

2. **Fill in Data:**
   ```csv
   amount,duration,interestRate
   10000,30,20
   5000,60,18
   15000,90,22
   ```

3. **Upload File:**
   - Click "Upload CSV"
   - Select your filled template
   - Loans will populate automatically

4. **Review and Submit:**
   - Check all imported loans
   - Make any necessary edits
   - Submit for processing

### Validation Rules

- ✅ Amount must be positive
- ✅ Duration must be one of: 30, 60, 90, 180, 360 days
- ✅ Interest rate must be between 15% and 25%
- ✅ Maximum 20 loans per batch
- ✅ Must respect your tier limits

### Results

After submission, you'll see:
- ✅ Green checkmark: Loan created successfully
- ❌ Red X: Loan failed with error message
- Batch summary with success/failure counts
- Individual ticket IDs for successful loans

---

## Bulk Investments

### Overview
Process multiple investments simultaneously with automatic balance verification.

### Step-by-Step Guide

1. **Navigate to Investments Tab**

2. **Enter Investment Details:**
   - **Ticket ID:** Enter the loan ticket to invest in
   - **Amount:** Enter investment amount in FCFA

3. **Add More Investments:**
   - Click "Add Investment" (max 20)
   - Remove with trash icon

4. **Review Total:**
   - Check total investment amount
   - Verify you have sufficient balance

5. **Submit:**
   - Click "Create X Investments"
   - System processes with transaction safety
   - View per-investment results

### CSV Format

```csv
ticketId,amount
TICKET-001,1000
TICKET-002,2000
TICKET-003,1500
```

### Important Notes

- 💰 **Balance Check:** System verifies wallet balance before processing
- 🔒 **Transaction Safe:** Uses atomic transactions to prevent partial failures
- ✅ **Ticket Validation:** Checks if loan ticket exists and is available
- ⚡ **Instant Updates:** Wallet balance updated immediately

### Error Handling

Common errors:
- "Insufficient balance" - Add funds to wallet
- "Ticket not found" - Verify ticket ID
- "Ticket already fully funded" - Choose another ticket
- "Amount exceeds ticket remaining" - Reduce investment amount

---

## Bulk Crypto Orders

### Overview
Create multiple cryptocurrency buy/sell orders at once.

### Supported Assets
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **USDT** - Tether
- **USDC** - USD Coin

### Step-by-Step Guide

1. **Navigate to Crypto Tab**

2. **Enter Order Details:**
   - **Asset:** Select BTC, ETH, USDT, or USDC
   - **Type:** Choose BUY or SELL
   - **Amount:** Enter asset amount (with decimals)
   - **Price:** Enter price per unit in FCFA

3. **View Order Total:**
   - System calculates: Amount × Price
   - See total BUY and SELL values

4. **Add More Orders:**
   - Click "Add Order" (max 20)
   - Mix buy and sell orders
   - Different assets allowed

5. **Submit:**
   - Click "Create X Orders"
   - Review results per order

### CSV Format

```csv
asset,type,amount,price
BTC,BUY,0.1,50000
ETH,SELL,1.5,3000
USDT,BUY,1000,1
USDC,BUY,500,1
```

### Validation Rules

- ✅ Asset must be: BTC, ETH, USDT, or USDC
- ✅ Type must be: BUY or SELL
- ✅ Amount must be positive (decimals allowed)
- ✅ Price must be positive
- ✅ Must respect tier limits
- ✅ Sufficient balance for BUY orders

---

## Bulk Messaging

### Overview
Send messages to multiple users or user groups. **Admin/Support only.**

### Recipient Options

#### Individual Recipients (Max 50)
- Enter user IDs or emails
- Separate with:
  - Commas: `user1@email.com, user2@email.com`
  - Semicolons: `user1@email.com; user2@email.com`
  - New lines (one per line)

#### Recipient Groups
- **All Users** - Every platform user
- **Active Investors** - Users with active investments
- **Active Borrowers** - Users with active loans
- **Premium Tier** - Premium tier members
- **Gold Tier** - Gold tier members
- **Platinum Tier** - Platinum tier members

### Step-by-Step Guide

1. **Navigate to Messages Tab** (Admin only)

2. **Choose Recipients:**
   - Option A: Select a group from dropdown
   - Option B: Enter individual recipients (max 50)

3. **Compose Message:**
   - **Subject:** Enter message subject (max 200 chars)
   - **Message:** Write your message (max 2,000 chars)
   - **Priority:** Select Low, Normal, High, or Urgent

4. **Delivery Methods:**
   - ☑️ **Send Push Notification**
   - ☑️ **Send Email**
   - Select at least one method

5. **Review and Send:**
   - Check recipient count
   - Review message content
   - Click "Send to X Recipients"

### Sample Message

Click "Load Sample Message" to see an example:
```
Subject: Important Platform Update

Message:
Dear User,

We are excited to announce new features available on the Coin Box platform:

• Enhanced security features
• Improved user interface
• New investment opportunities
• 24/7 customer support

Thank you for being a valued member of our community.

Best regards,
The Coin Box Team
```

### Priority Levels

- **Low:** Regular messages, no urgency
- **Normal:** Standard priority (default)
- **High:** Important notifications
- **Urgent:** Critical alerts requiring immediate attention

---

## Data Export

### Overview
Export your data in multiple formats for backup, analysis, or record-keeping.

### Exportable Data Types

1. **Loan Tickets** - All your loan applications
2. **Investments** - All your investment records
3. **Transactions** - All your transaction history
4. **Crypto Orders** - All your cryptocurrency orders

### Supported Formats

- **CSV** - Compatible with Excel, Google Sheets
- **JSON** - For developers and advanced users
- **Excel** - Microsoft Excel format

### Step-by-Step Guide

1. **Navigate to Export Tab**

2. **Configure Export:**
   - **Data Type:** Select what to export
   - **Format:** Choose CSV, JSON, or Excel
   - **Start Date:** (Optional) Filter from date
   - **End Date:** (Optional) Filter to date
   - **Max Records:** Select limit (100 - 10,000)

3. **Create Export:**
   - Click "Create Export"
   - Wait for processing (5-10 seconds)
   - Export appears in results

4. **Download File:**
   - Click "Download File" button
   - File saves to your device
   - **Note:** Files expire after 24 hours

### Export History

- View all your past exports
- See export status (Completed/Failed)
- Check file size and record count
- Track expiration times
- Re-download before expiration

### File Naming

Exports are named automatically:
```
export_{type}_{timestamp}_{userId}.{format}
```

Example: `export_loans_1734451200000_abc123.csv`

---

## Best Practices

### 1. Start Small
**Why:** Test the process before large batches  
**How:** Start with 2-3 items, verify results, then scale up

### 2. Validate Data
**Why:** Prevent errors and failed operations  
**How:**
- Double-check amounts and IDs
- Verify interest rates are within bounds
- Ensure sufficient wallet balance
- Confirm ticket availability

### 3. Use Templates
**Why:** Faster data entry, fewer errors  
**How:**
- Download CSV templates
- Fill in Excel or Google Sheets
- Use formulas for calculations
- Save templates for reuse

### 4. Review Before Submitting
**Why:** Catch mistakes early  
**Checklist:**
- ✅ All required fields filled
- ✅ No duplicate entries
- ✅ Totals are correct
- ✅ Within batch limits
- ✅ Meets validation rules

### 5. Check Results
**Why:** Verify successful processing  
**What to Check:**
- ✅ Green checkmarks for success
- ❌ Red X marks with error messages
- 📊 Batch summary statistics
- 🆔 Generated IDs (tickets, orders)

### 6. Monitor Limits
**Why:** Stay within your tier restrictions  
**Limits to Watch:**
- Maximum batch sizes (20 or 50)
- Tier-specific limits
- Wallet balance
- Daily/monthly quotas

### 7. Keep Records
**Why:** Track operations and maintain history  
**How:**
- Save batch IDs
- Export operation logs
- Download result summaries
- Keep CSV backups

---

## Troubleshooting

### Common Issues & Solutions

#### "Maximum batch size exceeded"
**Cause:** Too many items in batch  
**Solution:** Reduce to max allowed (20 or 50)

#### "Insufficient balance"
**Cause:** Wallet doesn't have enough funds  
**Solution:** Add funds before retrying

#### "Interest rate must be between 15% and 25%"
**Cause:** Rate outside valid range  
**Solution:** Adjust to 15-25%

#### "Ticket not found"
**Cause:** Invalid or non-existent ticket ID  
**Solution:** Verify ticket ID is correct

#### "CSV parsing error"
**Cause:** Malformed CSV file  
**Solution:**
- Check file format matches template
- Ensure no extra commas or quotes
- Verify column headers are correct
- Save as UTF-8 encoding

#### "Unauthorized"
**Cause:** Not logged in or session expired  
**Solution:** Log in again

#### "Admin access required"
**Cause:** Trying to access admin-only features  
**Solution:** Contact administrator

### Still Need Help?

1. **Check Status Page:** Verify system status
2. **Review Documentation:** Reread relevant section
3. **Contact Support:**
   - Email: support@coinbox.com
   - Live Chat: Available 24/7
   - Phone: +237 XXX XXX XXX

---

## FAQ

### General Questions

**Q: How long do batch operations take?**  
A: 2-10 seconds depending on batch size and operation type.

**Q: Can I cancel a batch operation?**  
A: No, once submitted, batches process immediately. Review carefully before submitting.

**Q: Are batch operations more expensive?**  
A: No, bulk operations have the same fees as individual operations.

**Q: Can I edit items after submission?**  
A: No, items cannot be edited after submission. Failed items can be resubmitted.

### Bulk Loans

**Q: What happens if one loan fails?**  
A: Other loans still process. Failed loan shows error message.

**Q: Can I create loans with different durations?**  
A: Yes, each loan can have its own duration.

**Q: Is there a minimum loan amount?**  
A: Check your tier limits. Generally, minimum is 1,000 FCFA.

### Bulk Investments

**Q: What if I don't have enough balance for all?**  
A: Investments process until balance is exhausted. Remaining fail with "Insufficient balance."

**Q: Can I invest in the same ticket multiple times?**  
A: Yes, until the ticket is fully funded.

**Q: Are investments processed in order?**  
A: Yes, top to bottom in your batch.

### Bulk Crypto

**Q: Can I mix BUY and SELL orders?**  
A: Yes, you can include both in the same batch.

**Q: Are orders executed immediately?**  
A: Depends on order type. Market orders execute immediately, limit orders when price is met.

**Q: What if crypto price changes during processing?**  
A: Orders use the price you specified, not current market price.

### Bulk Messages

**Q: Who can send bulk messages?**  
A: Only users with Admin or Support roles.

**Q: Can I send to specific user IDs?**  
A: Yes, enter user IDs or emails (max 50).

**Q: Do recipients see other recipients?**  
A: No, each message is sent individually.

**Q: Can I schedule messages for later?**  
A: Not currently. Feature coming in future update.

### Data Export

**Q: How long are exports available?**  
A: 24 hours. Download before expiration.

**Q: Can I export other users' data?**  
A: No, only your own data (admins can export any data).

**Q: What's the maximum export size?**  
A: 10,000 records per export.

**Q: Can I automate exports?**  
A: Not currently. API access coming in Phase 7 Week 2-3.

---

## Support & Feedback

### Need Help?
- **Documentation:** https://docs.coinbox.com
- **Support Email:** support@coinbox.com
- **Live Chat:** Available 24/7 in platform
- **Phone:** +237 XXX XXX XXX

### Report Issues
Found a bug? Help us improve:
1. Note the batch ID
2. Describe the issue
3. Include screenshots if possible
4. Email: bugs@coinbox.com

### Feature Requests
Have ideas? We'd love to hear:
- **Email:** feedback@coinbox.com
- **Form:** https://coinbox.com/feedback
- **Community:** Join our Discord server

---

## What's Next?

### Upcoming Features (Phase 7 Week 2-3)

**API Access (Beta):**
- API key generation
- RESTful endpoints for bulk operations
- Webhook notifications
- JavaScript & Python SDKs
- Developer portal

**Enhanced Features:**
- Scheduled batch operations
- Recurring bulk tasks
- Advanced filters for exports
- Bulk edit/update operations
- Real-time progress tracking

Stay tuned for updates!

---

**Document Version:** 1.0  
**Last Updated:** December 17, 2025  
**Feature Status:** Production Ready ✅

---

*This guide is part of the Coin Box Phase 7 implementation. For the complete documentation, visit https://docs.coinbox.com*

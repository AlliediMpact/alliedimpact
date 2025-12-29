# Savings Jar User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [How to Use](#how-to-use)
5. [Analytics](#analytics)
6. [Fees](#fees)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Introduction

The Savings Jar is an innovative automatic savings feature designed to help you build your savings effortlessly. By automatically setting aside a portion of your P2P payments, you can grow your emergency fund without thinking about it.

### Key Benefits
- **Automatic Savings**: Money is saved automatically from P2P payments
- **Flexible**: Manually deposit or adjust settings anytime
- **Secure**: Bank-level security with Firebase
- **Transparent**: View all transactions and analytics
- **Accessible**: Withdraw funds when you need them

## Getting Started

### Automatic Creation
Your Savings Jar is created automatically the first time you:
- Receive a P2P payment above your threshold, OR
- Make your first manual deposit

### Setting Your Threshold
1. Navigate to your Savings Jar dashboard
2. Look for the "Auto-Save Threshold" setting
3. Enter your preferred amount (default: R100)
4. Click "Save Settings"

**What is a threshold?**
The threshold is the minimum amount that stays in your wallet after a P2P payment. Any excess is automatically saved.

**Example:**
- Your threshold: R100
- You receive: R150
- R50 is automatically saved
- R100 remains in your wallet

## Features

### 1. Automatic Saving
- Triggered by P2P payments exceeding your threshold
- Happens instantly and seamlessly
- No manual action required

### 2. Manual Deposits
- Transfer money from your main wallet anytime
- Instant processing
- No fees on deposits

### 3. Withdrawals
- Access your savings whenever needed
- 1% withdrawal fee applies
- Funds return to your main wallet immediately

### 4. Transaction History
- View all deposits and withdrawals
- Timestamps and amounts displayed
- Filter and search capabilities

### 5. Analytics Dashboard
- Track your savings over time
- See deposit and withdrawal trends
- Get personalized insights
- Monitor your savings rate

## How to Use

### Making a Deposit

1. **Navigate** to your Savings Jar dashboard
2. **Enter Amount** in the deposit field
3. **Click "Deposit"** button
4. **Confirm** the transaction
5. **Success!** Your balance updates immediately

**Requirements:**
- Sufficient balance in main wallet
- Amount must be greater than R0

### Making a Withdrawal

1. **Navigate** to your Savings Jar dashboard
2. **Enter Amount** in the withdrawal field
3. **Review** the 1% fee calculation
4. **Click "Withdraw"** button
5. **Confirm** the transaction
6. **Success!** Net amount appears in your wallet

**Fee Example:**
- Withdrawal amount: R100
- Fee (1%): R1
- You receive: R99

**Requirements:**
- Sufficient balance in Savings Jar
- Amount must not exceed your balance

### Viewing Transactions

1. **Navigate** to your Savings Jar dashboard
2. **Scroll** to the "Transaction History" section
3. **View** all your deposits and withdrawals
4. **Filter** by type or date if needed

### Adjusting Auto-Save Settings

1. **Navigate** to your Savings Jar dashboard
2. **Find** the "Auto-Save Threshold" section
3. **Enter** your new preferred threshold
4. **Click "Save"** to apply changes

**Tips:**
- Lower threshold = More automatic savings
- Higher threshold = Less automatic savings
- Set to R10,000+ to effectively disable auto-save

## Analytics

### Accessing Analytics
Navigate to: Dashboard > Savings Jar > Analytics

### Key Metrics

#### Current Balance
Your total savings at this moment

#### Total Deposited
All money you've added (automatic + manual)

#### Total Withdrawn
All money you've taken out

#### Savings Rate
Percentage of deposits that remain saved
- 80%+ = Excellent
- 50-79% = Good
- <50% = Room for improvement

### Charts and Trends

#### Deposit Trends
- Line chart showing daily deposits
- Helps identify saving patterns
- Spot your most productive saving periods

#### Withdrawal Trends
- Line chart showing daily withdrawals
- Understand your spending patterns
- Identify potential areas to reduce withdrawals

#### Comparison View
- Bar chart: Deposits vs Withdrawals
- Visualize your net savings
- See balance changes over time

### Personalized Insights

The system analyzes your behavior and provides:
- Congratulations for good habits
- Tips for improving savings
- Warnings about concerning patterns
- Suggestions for reaching goals faster

## Fees

### Deposit Fees
**None** - All deposits are free!

### Withdrawal Fees
**1% of withdrawal amount**

#### Fee Calculation
```
Fee = Withdrawal Amount × 0.01
Net Amount = Withdrawal Amount - Fee
```

#### Examples
| Withdrawal | Fee (1%) | You Receive |
|-----------|----------|-------------|
| R50       | R0.50    | R49.50      |
| R100      | R1.00    | R99.00      |
| R500      | R5.00    | R495.00     |
| R1,000    | R10.00   | R990.00     |

### Why Fees?
- Platform maintenance
- Security infrastructure
- Encourages longer-term saving
- Supports feature development

## Best Practices

### 1. Set Realistic Thresholds
- Start with R100 if unsure
- Adjust based on your income
- Consider your monthly expenses

### 2. Let It Build
- Avoid frequent withdrawals
- Treat as emergency fund
- Watch it grow over time

### 3. Review Analytics Monthly
- Check your savings rate
- Identify improvement opportunities
- Celebrate milestones

### 4. Use Manual Deposits
- Add windfalls (bonuses, gifts)
- Round up your balance
- Hit specific savings goals

### 5. Plan Withdrawals
- Only withdraw when necessary
- Consider the 1% fee impact
- Withdraw larger amounts less often

### 6. Monitor Transactions
- Review history regularly
- Spot any errors quickly
- Track progress toward goals

## Troubleshooting

### Deposit Failed
**Possible Causes:**
- Insufficient balance in main wallet
- Network connection issue
- Invalid amount (negative or zero)

**Solutions:**
1. Check your main wallet balance
2. Verify internet connection
3. Try again with valid amount
4. Contact support if issue persists

### Withdrawal Failed
**Possible Causes:**
- Insufficient balance in Savings Jar
- Amount exceeds balance
- Network connection issue

**Solutions:**
1. Check your Savings Jar balance
2. Reduce withdrawal amount
3. Verify internet connection
4. Contact support if issue persists

### Auto-Save Not Working
**Possible Causes:**
- Threshold set too high
- P2P payment below threshold
- Feature not enabled

**Solutions:**
1. Verify threshold setting
2. Check P2P payment amounts
3. Confirm feature is enabled
4. Contact support for investigation

### Balance Doesn't Match
**Possible Causes:**
- Page needs refresh
- Recent transaction not loaded
- Cache issue

**Solutions:**
1. Refresh the page
2. Check transaction history
3. Clear browser cache
4. Wait a few minutes and check again

### Can't See Analytics
**Possible Causes:**
- No transaction data yet
- Loading issue
- Browser compatibility

**Solutions:**
1. Make at least one transaction
2. Refresh the page
3. Try a different browser
4. Contact support if issue continues

## FAQ

### General Questions

**Q: Is my money safe?**
A: Yes! Your savings are secured with Firebase Firestore, which uses bank-level encryption and security protocols.

**Q: Can I have multiple Savings Jars?**
A: Currently, each user has one Savings Jar. Multiple jars may be introduced in future updates.

**Q: Does my savings earn interest?**
A: Not currently. The Savings Jar is a secure storage solution. Interest-bearing accounts may come later.

**Q: What's the minimum deposit?**
A: There's no strict minimum, but deposits must be greater than R0.

**Q: What's the maximum balance?**
A: There's no maximum limit on your Savings Jar balance.

### Fees & Charges

**Q: Why is there a withdrawal fee?**
A: The 1% fee helps maintain the platform and encourages better saving habits by reducing frequent withdrawals.

**Q: Are there any other hidden fees?**
A: No. The only fee is the 1% withdrawal fee. Deposits are completely free.

**Q: Can the fee be waived?**
A: Currently, no. The 1% withdrawal fee applies to all withdrawals regardless of amount or frequency.

### Technical Questions

**Q: How long do transactions take?**
A: All deposits and withdrawals are instant, typically completing within seconds.

**Q: Can I cancel a transaction?**
A: No. Once confirmed, transactions are immediate and cannot be reversed.

**Q: What if I make a mistake?**
A: If you deposited or withdrew incorrectly, you can immediately perform the opposite transaction to correct it.

**Q: Is there a transaction limit?**
A: No daily limits, but withdrawal amounts cannot exceed your current balance.

### Account & Security

**Q: What if I forget my threshold setting?**
A: Your current threshold is always displayed on your Savings Jar dashboard.

**Q: Can someone else access my Savings Jar?**
A: No. Your Savings Jar is protected by your account login credentials.

**Q: What happens if my account is compromised?**
A: Contact support immediately. We can freeze your account and investigate any unauthorized transactions.

## Getting Help

### Support Channels

**Email Support**
- support@coinbox.com
- Response within 24 hours
- Include account details and issue description

**In-App Help**
- Navigate to Savings Jar > Help
- Access guides, FAQs, and video tutorials
- Submit bug reports

### When to Contact Support

Contact support if you experience:
- Transactions not appearing after 5 minutes
- Repeated failed transactions with no clear cause
- Discrepancies in your balance
- Unauthorized access or suspicious activity
- Technical errors you can't resolve

### Information to Provide

When contacting support, include:
1. Your account email
2. Description of the issue
3. When it occurred
4. Any error messages
5. Screenshots if applicable
6. Steps you've already tried

---

**Last Updated**: January 2025
**Version**: 1.0.0

For the latest information and updates, visit your Savings Jar dashboard.

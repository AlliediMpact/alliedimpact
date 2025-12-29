# Referral Program v2 - Quick Start Guide for Developers

## Overview
The enhanced referral system pays 3-level commissions when users sign up or upgrade memberships. Users earn badges and XP as they refer more people.

---

## Quick Facts

**Commission Events:**
- ✅ User sign-up (security fee)
- ✅ Membership upgrade (upgrade fee)
- ❌ Trade transactions (handled by old system)

**Commission Levels:**
- **Level 1:** Direct referrer (2-5% depending on tier)
- **Level 2:** Referrer's referrer (0.5%)
- **Level 3:** Level 2's referrer (0.1%)

**Badge Milestones:**
- **Bronze:** 4 referrals → R50 + 20 XP
- **Silver:** 12 referrals → R100 + 40 XP
- **Gold:** 25 referrals → R200 + 75 XP
- **Diamond:** 100 referrals → R500 + 200 XP

---

## How to Use

### 1. Process Commissions (Server-Side)

```typescript
import { enhancedReferralCommissionService } from '@/lib/enhanced-referral-commission-service';
import { CommissionEventType } from '@/config/referral-commission-config';

// On user sign-up:
const result = await enhancedReferralCommissionService.processCommissions(
  userId,                           // New user's ID
  CommissionEventType.USER_SIGNUP,  // Event type
  1000,                             // Security fee amount (R1000)
  `signup_${userId}_${Date.now()}`  // Unique event ID (for idempotency)
);

// On membership upgrade:
const result = await enhancedReferralCommissionService.processCommissions(
  userId,                               // Upgrading user's ID
  CommissionEventType.MEMBERSHIP_UPGRADE, // Event type
  2000,                                 // Upgrade fee amount (R2000)
  `upgrade_${userId}_${tierId}_${Date.now()}` // Unique event ID
);

// Check result:
if (result.success) {
  console.log(`Processed ${result.commissionsProcessed} commissions`);
  console.log(`Total amount: R${result.totalAmount}`);
} else {
  console.error(`Error: ${result.error}`);
}
```

### 2. Get User Referral Stats (Client-Side)

```typescript
import { enhancedReferralCommissionService } from '@/lib/enhanced-referral-commission-service';

const stats = await enhancedReferralCommissionService.getUserReferralStats(userId);

console.log('Direct Referrals:', stats.directReferrals);
console.log('Level 2 Referrals:', stats.level2Referrals);
console.log('Level 3 Referrals:', stats.level3Referrals);
console.log('Total Commissions:', stats.totalCommissions);
console.log('Unlocked Badges:', stats.badgesUnlocked); // ['BRONZE', 'SILVER']
console.log('Total XP:', stats.totalXP);
console.log('Next Badge:', stats.nextBadge); // 'Gold Badge'
console.log('Progress:', stats.nextBadgeProgress); // 60%
```

### 3. Display Badges in UI

```tsx
import { BadgeDisplay } from '@/components/referral/BadgeDisplay';

<BadgeDisplay
  unlockedBadges={stats.badgesUnlocked}
  totalXP={stats.totalXP}
  directReferrals={stats.directReferrals}
  nextBadge={stats.nextBadge}
  nextBadgeProgress={stats.nextBadgeProgress}
/>
```

---

## Configuration

All rates and rewards are in `/src/config/referral-commission-config.ts`:

```typescript
// Commission Rates (%)
export const REFERRAL_COMMISSION_RATES = {
  Basic:      { level1: 2,  level2: 0.5, level3: 0.1 },
  Ambassador: { level1: 3,  level2: 0.5, level3: 0.1 },
  VIP:        { level1: 4,  level2: 0.5, level3: 0.1 },
  Business:   { level1: 5,  level2: 0.5, level3: 0.1 },
};

// Badge Requirements
export const BADGE_SYSTEM = {
  BRONZE:  { directReferralsRequired: 4,   rewardAmount: 50,  xpReward: 20  },
  SILVER:  { directReferralsRequired: 12,  rewardAmount: 100, xpReward: 40  },
  GOLD:    { directReferralsRequired: 25,  rewardAmount: 200, xpReward: 75  },
  DIAMOND: { directReferralsRequired: 100, rewardAmount: 500, xpReward: 200 },
};
```

**To modify rates:** Edit the config file and rebuild the app. No database changes needed.

---

## Database Schema

### Users Collection (Extended)

```typescript
users/{userId} {
  // New fields:
  level2ParentId?: string,      // Level 2 parent
  level3ParentId?: string,      // Level 3 parent
  directReferralsCount: number, // For badge tracking
  xp: number,                   // User XP
  unlockedBadges: string[],     // Badge keys
}
```

### Referral Commissions Collection (New)

```typescript
referralCommissions/{commissionId} {
  referrerId: string,
  referredUserId: string,
  eventType: 'signup' | 'upgrade',
  eventId: string,              // For idempotency
  level: 1 | 2 | 3,
  amount: number,
  commissionRate: number,
  status: 'paid' | 'pending' | 'failed',
  createdAt: Timestamp,
}
```

### User Achievements Collection (New)

```typescript
userAchievements/{userId} {
  badgesUnlocked: string[],
  totalXP: number,
  lastBadgeUnlockedAt?: Timestamp,
}
```

---

## Important Notes

### Idempotency
- Always provide a **unique `eventId`** when processing commissions
- Format: `{eventType}_{userId}_{timestamp}` or `{eventType}_{userId}_{additionalInfo}_{timestamp}`
- System will skip duplicate events automatically

### Error Handling
- Commission processing failures **do not** break signup/upgrade flows
- Errors are logged for manual review
- Users are notified of successful commissions via notifications

### Testing
- Use Firestore emulator for local testing
- Test event IDs must be unique per test run
- Check wallet balances after commission processing

---

## Common Tasks

### Check if user qualifies for badge:
```typescript
import { checkBadgeQualification, BADGE_SYSTEM } from '@/config/referral-commission-config';

const qualifiedBadge = checkBadgeQualification(
  15,                    // Direct referral count
  ['BRONZE', 'SILVER']   // Already unlocked badges
);

if (qualifiedBadge) {
  console.log(`User qualifies for ${qualifiedBadge.name}!`);
}
```

### Get commission rate for a user:
```typescript
import { getCommissionRate } from '@/config/referral-commission-config';

const rate = getCommissionRate('Business', 1); // 5% for Level 1
const rate2 = getCommissionRate('Basic', 2);   // 0.5% for Level 2
```

### Calculate commission amount:
```typescript
const membershipFee = 1000; // R1000
const tier = 'Ambassador';
const level = 1;

const rate = getCommissionRate(tier, level); // 3%
const commission = (membershipFee * rate) / 100; // R30
```

---

## Troubleshooting

### Commission not processing:
1. Check if `eventId` is unique
2. Verify user has a referrer (`referrerId` field)
3. Check Firestore logs for errors
4. Verify wallet service is accessible

### Badge not unlocking:
1. Check `directReferralsCount` field on user document
2. Verify threshold in `BADGE_SYSTEM` config
3. Check `unlockedBadges` array (might already be unlocked)
4. Trigger `checkAndAwardBadges()` manually

### Stats not showing:
1. Ensure user document has new fields (`level2ParentId`, etc.)
2. Run database migration if upgrading from old system
3. Check if `enhancedReferralCommissionService` is imported correctly

---

## Migration Checklist

Before deploying:
- [ ] Run database migration script (see `REFERRAL_V2_DATABASE_MIGRATION.md`)
- [ ] Add new fields to existing users
- [ ] Backfill referral chains (Level 2, Level 3)
- [ ] Create Firestore indexes
- [ ] Update Firestore security rules
- [ ] Test commission processing in staging
- [ ] Test badge unlock in staging
- [ ] Monitor logs for 48 hours after deployment

---

## References

- **Full Implementation Guide:** `/docs/PHASE_7_FEATURE_4_COMPLETE.md`
- **Database Migration:** `/docs/REFERRAL_V2_DATABASE_MIGRATION.md`
- **Configuration:** `/src/config/referral-commission-config.ts`
- **Commission Service:** `/src/lib/enhanced-referral-commission-service.ts`
- **Badge Component:** `/src/components/referral/BadgeDisplay.tsx`

---

## Support

For questions or issues:
1. Check the full implementation guide
2. Review Firestore logs
3. Verify configuration values
4. Test with Firestore emulator locally

---

**Version:** 2.0.0  
**Last Updated:** January 2025

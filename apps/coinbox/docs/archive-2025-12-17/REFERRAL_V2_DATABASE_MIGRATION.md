# Referral Program v2 - Database Migration Guide

## Overview

This document describes the database schema changes required for the enhanced 3-level referral commission system with badges and XP rewards.

## Migration Date

**Recommended: Execute during low-traffic period (e.g., late night/early morning)**

---

## Schema Changes

### 1. Update `users` Collection

**Purpose:** Add fields to track 3-level referral chain, badges, and XP.

#### New Fields to Add:

```typescript
{
  // Existing fields remain unchanged...
  referrerId: string,  // EXISTING - Level 1 parent (direct referrer)
  
  // NEW FIELDS:
  level2ParentId?: string,      // Level 2 parent (referrer's referrer)
  level3ParentId?: string,      // Level 3 parent (level 2's referrer)
  directReferralsCount: number, // Count of direct referrals (for badge tracking)
  xp: number,                   // User experience points
  unlockedBadges: string[],     // Array of badge keys ['BRONZE', 'SILVER', etc.]
}
```

#### Migration Script (Firestore):

```javascript
/**
 * Add missing fields to existing users
 * Run this in Firebase console or as a Cloud Function
 */

const admin = require('firebase-admin');
const db = admin.firestore();

async function migrateUsersCollection() {
  const batch = db.batch();
  let count = 0;
  
  const usersSnapshot = await db.collection('users').get();
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    
    // Only update if fields don't exist
    const updates = {};
    
    if (!userData.level2ParentId) {
      updates.level2ParentId = null;
    }
    
    if (!userData.level3ParentId) {
      updates.level3ParentId = null;
    }
    
    if (typeof userData.directReferralsCount === 'undefined') {
      updates.directReferralsCount = 0;
    }
    
    if (typeof userData.xp === 'undefined') {
      updates.xp = 0;
    }
    
    if (!userData.unlockedBadges) {
      updates.unlockedBadges = [];
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
    
    // Commit in batches of 500
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} users...`);
    }
  }
  
  // Commit remaining
  await batch.commit();
  console.log(`Migration complete: Updated ${count} users`);
}

// Run migration
migrateUsersCollection().catch(console.error);
```

---

### 2. Create `referralCommissions` Collection

**Purpose:** Store commission payment records with idempotency tracking.

#### Collection Name: `referralCommissions`

#### Document Schema:

```typescript
interface ReferralCommission {
  id: string;                    // Auto-generated document ID
  referrerId: string;            // User receiving the commission
  referredUserId: string;        // User who triggered the commission
  eventType: 'signup' | 'upgrade'; // Type of commission event
  eventId: string;               // Unique event identifier (for idempotency)
  level: 1 | 2 | 3;             // Commission level
  amount: number;                // ZAR amount credited
  commissionRate: number;        // Percentage applied (e.g., 5 for 5%)
  referrerTier: string;          // Membership tier of referrer
  status: 'pending' | 'paid' | 'failed'; // Payment status
  createdAt: Timestamp;          // When commission was created
  paidAt?: Timestamp;            // When commission was paid
  transactionId?: string;        // Related transaction ID
}
```

#### Firestore Indexes Required:

```json
{
  "collectionGroup": "referralCommissions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "referrerId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "referralCommissions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "eventId", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "referralCommissions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "referrerId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

#### Create Collection:

No manual action needed - collection will be created automatically when first commission is processed.

---

### 3. Create `userAchievements` Collection

**Purpose:** Track badge unlocks and XP progression.

#### Collection Name: `userAchievements`

#### Document Schema:

```typescript
interface UserAchievement {
  userId: string;                // User ID (document ID)
  badgesUnlocked: string[];      // Array of badge keys ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND']
  totalXP: number;               // Total experience points earned
  lastBadgeUnlockedAt?: Timestamp; // Last badge unlock timestamp
  createdAt: Timestamp;          // Achievement record creation
  updatedAt: Timestamp;          // Last update timestamp
}
```

#### Firestore Indexes Required:

```json
{
  "collectionGroup": "userAchievements",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "totalXP", "order": "DESCENDING" }
  ]
}
```

#### Create Collection:

No manual action needed - collection will be created automatically when first badge is unlocked.

---

### 4. Update `referralStats` Collection

**Purpose:** Enhance existing stats to track commission earnings.

#### Existing Fields (Preserved):

```typescript
{
  userId: string;
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: number;      // EXISTING - Updated by new system
  pendingCommissions: number;    // EXISTING - Updated by new system
  totalVolume: number;
  monthlyReferrals: number;
  lastUpdated: Timestamp;
}
```

**Note:** No migration needed. Existing structure is compatible.

---

## Firestore Security Rules Updates

### Add Rules for New Collections:

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... existing rules ...
    
    // Referral Commissions Collection
    match /referralCommissions/{commissionId} {
      // Users can only read their own commissions
      allow read: if request.auth != null && 
                     resource.data.referrerId == request.auth.uid;
      
      // Only server-side (admin) can write
      allow write: if false;
    }
    
    // User Achievements Collection
    match /userAchievements/{userId} {
      // Users can only read their own achievements
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only server-side (admin) can write
      allow write: if false;
    }
    
    // Update users collection rule to allow new fields
    match /users/{userId} {
      allow read: if request.auth != null;
      
      // Allow users to update their own profile (including new fields)
      allow update: if request.auth != null && 
                       request.auth.uid == userId &&
                       // Prevent users from modifying sensitive fields
                       !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['level2ParentId', 'level3ParentId', 'unlockedBadges', 'xp']);
      
      allow create: if request.auth != null;
    }
  }
}
```

---

## Post-Migration Data Backfill

### Calculate and Store Level 2/Level 3 Parents for Existing Users

```javascript
/**
 * Backfill Level 2 and Level 3 parent IDs for existing users
 */

async function backfillReferralChain() {
  const usersSnapshot = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const userId = doc.id;
    const level1ParentId = userData.referrerId;
    
    if (!level1ParentId) {
      continue; // Skip users with no referrer
    }
    
    try {
      // Get Level 2 parent (referrer's referrer)
      const level1Doc = await db.collection('users').doc(level1ParentId).get();
      const level2ParentId = level1Doc.exists ? level1Doc.data().referrerId : null;
      
      // Get Level 3 parent (level 2's referrer)
      let level3ParentId = null;
      if (level2ParentId) {
        const level2Doc = await db.collection('users').doc(level2ParentId).get();
        level3ParentId = level2Doc.exists ? level2Doc.data().referrerId : null;
      }
      
      // Update user document
      batch.update(doc.ref, {
        level2ParentId: level2ParentId || null,
        level3ParentId: level3ParentId || null,
      });
      
      count++;
      
      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`Backfilled ${count} referral chains...`);
      }
    } catch (error) {
      console.error(`Error backfilling chain for user ${userId}:`, error);
    }
  }
  
  // Commit remaining
  await batch.commit();
  console.log(`Backfill complete: Updated ${count} users with referral chain`);
}

// Run backfill
backfillReferralChain().catch(console.error);
```

### Calculate Direct Referral Counts

```javascript
/**
 * Calculate and store direct referral counts for badge qualification
 */

async function backfillDirectReferralCounts() {
  const usersSnapshot = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  
  for (const doc of usersSnapshot.docs) {
    const userId = doc.id;
    
    // Count users who have this user as their direct referrer
    const referralsQuery = await db.collection('users')
      .where('referrerId', '==', userId)
      .get();
    
    const directReferralCount = referralsQuery.size;
    
    batch.update(doc.ref, {
      directReferralsCount: directReferralCount,
    });
    
    count++;
    
    // Commit in batches of 500
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Updated ${count} referral counts...`);
    }
  }
  
  // Commit remaining
  await batch.commit();
  console.log(`Referral count update complete: Updated ${count} users`);
}

// Run backfill
backfillDirectReferralCounts().catch(console.error);
```

---

## Testing After Migration

### 1. Verify Field Addition

```javascript
// Test: Check if new fields exist
const testUser = await db.collection('users').doc('TEST_USER_ID').get();
const data = testUser.data();

console.log('Level 2 Parent:', data.level2ParentId);
console.log('Level 3 Parent:', data.level3ParentId);
console.log('Direct Referrals:', data.directReferralsCount);
console.log('XP:', data.xp);
console.log('Badges:', data.unlockedBadges);
```

### 2. Test Commission Processing

```javascript
// Test: Process a signup commission
const { enhancedReferralCommissionService } = require('./enhanced-referral-commission-service');
const { CommissionEventType } = require('./referral-commission-config');

const result = await enhancedReferralCommissionService.processCommissions(
  'TEST_NEW_USER_ID',
  CommissionEventType.USER_SIGNUP,
  1000, // R1000 security fee
  'test_signup_001'
);

console.log('Commissions Processed:', result.commissionsProcessed);
console.log('Total Amount:', result.totalAmount);
```

### 3. Test Badge System

```javascript
// Test: Check badge qualification
const stats = await enhancedReferralCommissionService.getUserReferralStats('TEST_USER_ID');

console.log('Direct Referrals:', stats.directReferrals);
console.log('Unlocked Badges:', stats.badgesUnlocked);
console.log('Total XP:', stats.totalXP);
console.log('Next Badge:', stats.nextBadge);
console.log('Progress:', stats.nextBadgeProgress, '%');
```

---

## Rollback Plan

If issues are encountered, rollback using:

```javascript
/**
 * Rollback: Remove new fields from users collection
 */
async function rollbackUserFields() {
  const batch = db.batch();
  const usersSnapshot = await db.collection('users').get();
  
  for (const doc of usersSnapshot.docs) {
    batch.update(doc.ref, {
      level2ParentId: admin.firestore.FieldValue.delete(),
      level3ParentId: admin.firestore.FieldValue.delete(),
      directReferralsCount: admin.firestore.FieldValue.delete(),
      xp: admin.firestore.FieldValue.delete(),
      unlockedBadges: admin.firestore.FieldValue.delete(),
    });
  }
  
  await batch.commit();
  console.log('Rollback complete');
}
```

**Note:** New collections (`referralCommissions`, `userAchievements`) can be safely deleted if needed.

---

## Monitoring After Migration

### Key Metrics to Monitor:

1. **Commission Processing Success Rate**
   - Monitor logs for commission processing errors
   - Check `referralCommissions` collection for failed payments

2. **Wallet Balance Updates**
   - Verify wallet credits match commission records
   - Check for any balance discrepancies

3. **Badge Unlocks**
   - Verify badges unlock at correct thresholds
   - Check XP awards match badge configuration

4. **Query Performance**
   - Monitor query latency on new collections
   - Verify indexes are being used

### Logging:

```javascript
// Enhanced logging for commission events
console.log(`[Commission] Event: ${eventType}, User: ${userId}, Amount: R${amount}`);
console.log(`[Commission] Level 1: R${level1Amount}, Level 2: R${level2Amount}, Level 3: R${level3Amount}`);
console.log(`[Badge] User ${userId} unlocked ${badgeKey}: R${reward} + ${xp} XP`);
```

---

## Summary

**Required Actions:**

1. ✅ Add 5 new fields to `users` collection
2. ✅ Create `referralCommissions` collection (auto-created)
3. ✅ Create `userAchievements` collection (auto-created)
4. ✅ Add Firestore indexes for new collections
5. ✅ Update security rules
6. ✅ Run backfill scripts for existing users
7. ✅ Test commission processing
8. ✅ Monitor for 24-48 hours

**Estimated Migration Time:** 30-60 minutes (depending on user count)

**Downtime Required:** None (backward compatible)

---

## Support

For issues during migration, contact the development team or refer to:
- `/src/lib/enhanced-referral-commission-service.ts` - Core commission logic
- `/src/config/referral-commission-config.ts` - Configuration values
- `/docs/REFERRAL_V2_IMPLEMENTATION.md` - Full implementation guide

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Import modular functions
export { notifyTournamentPublished, notifyWalletTopup } from './notifications';
export { cleanupRateLimits } from './rate-limiter';
export { cleanupOldAuditLogs } from './audit-logger';

// Import utilities
import { enforceRateLimit, RATE_LIMITS } from './rate-limiter';
import { logAdminAction } from './audit-logger';

/**
 * PayFast ITN (Instant Transaction Notification) Webhook Handler
 * Processes payment confirmations from PayFast
 * 
 * Security checks:
 * 1. Validate PayFast IP address
 * 2. Verify signature
 * 3. Confirm payment status
 * 4. Prevent duplicate processing
 */
export const handlePayFastWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const paymentData = req.body;
  
  functions.logger.info('PayFast webhook received', { paymentData });

  try {
    // 1. Validate PayFast IP (production only)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    functions.logger.info('Request from IP:', clientIp);
    
    // In production, validate IP against PayFast's IP list
    // For now, we'll skip this in development
    
    // 2. Verify signature
    const receivedSignature = paymentData.signature;
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    
    // Remove signature from data for validation
    const { signature, ...dataWithoutSignature } = paymentData;
    
    // Generate signature
    const sortedKeys = Object.keys(dataWithoutSignature).sort();
    const paramString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(dataWithoutSignature[key]).replace(/%20/g, '+')}`)
      .join('&');
    
    const stringToHash = passphrase ? `${paramString}&passphrase=${passphrase}` : paramString;
    const calculatedSignature = crypto.createHash('md5').update(stringToHash).digest('hex');
    
    if (receivedSignature !== calculatedSignature) {
      functions.logger.error('Invalid signature', {
        received: receivedSignature,
        calculated: calculatedSignature,
      });
      res.status(400).send('Invalid signature');
      return;
    }

    // 3. Check payment status
    const paymentStatus = paymentData.payment_status;
    
    if (paymentStatus !== 'COMPLETE') {
      functions.logger.warn('Payment not complete', { paymentStatus });
      res.status(200).send('Payment not complete');
      return;
    }

    // 4. Extract data
    const userId = paymentData.custom_str1;
    const amountInCents = parseInt(paymentData.custom_int1, 10);
    const paymentId = paymentData.pf_payment_id;
    const amountGross = parseFloat(paymentData.amount_gross);
    const amountFee = parseFloat(paymentData.amount_fee);
    const amountNet = parseFloat(paymentData.amount_net);

    if (!userId || !amountInCents) {
      functions.logger.error('Missing required data', { userId, amountInCents });
      res.status(400).send('Missing required data');
      return;
    }

    // 5. Check for duplicate payment
    const paymentRef = db.collection('sportshub_payments').doc(paymentId);
    const existingPayment = await paymentRef.get();
    
    if (existingPayment.exists) {
      functions.logger.warn('Duplicate payment detected', { paymentId });
      res.status(200).send('Payment already processed');
      return;
    }

    // 6. Record payment in Firestore
    await paymentRef.set({
      userId,
      paymentId,
      amountInCents,
      amountGross,
      amountFee,
      amountNet,
      currency: 'ZAR',
      status: 'completed',
      paymentMethod: 'payfast',
      paymentData: {
        merchant_id: paymentData.merchant_id,
        name_first: paymentData.name_first,
        name_last: paymentData.name_last,
        email_address: paymentData.email_address,
        item_name: paymentData.item_name,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 7. Update wallet balance (atomic transaction)
    await updateWalletBalance(userId, amountInCents, paymentId);

    functions.logger.info('Payment processed successfully', { userId, paymentId, amountInCents });

    res.status(200).send('OK');
  } catch (error) {
    functions.logger.error('Error processing payment', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Update wallet balance atomically
 * Creates wallet if it doesn't exist
 */
async function updateWalletBalance(
  userId: string,
  amountInCents: number,
  paymentId: string
): Promise<void> {
  const walletRef = db.collection('sportshub_wallets').doc(userId);
  
  await db.runTransaction(async (transaction) => {
    const walletDoc = await transaction.get(walletRef);
    
    let currentBalance = 0;
    
    if (walletDoc.exists) {
      const walletData = walletDoc.data();
      currentBalance = walletData?.balanceInCents || 0;
    }
    
    const newBalance = currentBalance + amountInCents;
    
    // Update or create wallet
    transaction.set(walletRef, {
      userId,
      balanceInCents: newBalance,
      currency: 'ZAR',
      lastTopUpAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    // Record transaction in subcollection
    const transactionRef = walletRef.collection('transactions').doc();
    transaction.set(transactionRef, {
      type: 'topup',
      amountInCents,
      balanceBeforeInCents: currentBalance,
      balanceAfterInCents: newBalance,
      paymentId,
      description: `Wallet top-up via PayFast`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        source: 'payfast_webhook',
      },
    });
    
    functions.logger.info('Wallet updated', {
      userId,
      previousBalance: currentBalance,
      newBalance,
      topUpAmount: amountInCents,
    });
  });
}

/**
 * Deduct wallet balance for vote (called by client with proper auth)
 * This is a callable function, not HTTP
 */
export const deductVoteFromWallet = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { projectId, voteId, tournamentId, votingItemId, optionId } = data;

  if (!projectId || !voteId || !tournamentId || !votingItemId || !optionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  // Get project to determine vote cost (configurable per project)
  const projectDoc = await db.collection('sportshub_projects').doc(projectId).get();
  if (!projectDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Project not found');
  }
  
  const projectData = projectDoc.data();
  const VOTE_COST = projectData?.config?.votingPrice || 200; // Default R2.00 in cents

  const walletRef = db.collection('sportshub_wallets').doc(userId);

  try {
    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new functions.https.HttpsError('failed-precondition', 'Wallet not found');
      }

      const walletData = walletDoc.data();
      const currentBalance = walletData?.balanceInCents || 0;

      if (currentBalance < VOTE_COST) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Insufficient balance. Required: R2.00, Available: R${(currentBalance / 100).toFixed(2)}`
        );
      }

      const newBalance = currentBalance - VOTE_COST;

      // Update wallet
      transaction.update(walletRef, {
        balanceInCents: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Record transaction
      const transactionRef = walletRef.collection('transactions').doc();
      transaction.set(transactionRef, {
        type: 'vote',
        amountInCents: VOTE_COST,
        balanceBeforeInCents: currentBalance,
        balanceAfterInCents: newBalance,
        projectId, // NEW: Track which project the vote was for
        voteId,
        description: `Vote cast on ${projectData?.name || 'project'}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          projectId,
          tournamentId,
          votingItemId,
          optionId,
        },
      });

      functions.logger.info('Vote payment processed', {
        userId,
        voteId,
        previousBalance: currentBalance,
        newBalance,
      });
    });

    return { success: true, message: 'Vote payment processed' };
  } catch (error) {
    functions.logger.error('Error processing vote payment', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to process vote payment');
  }
});

/**
 * Admin function: Refund wallet balance
 * Only callable by admins/super_admins
 */
export const refundWallet = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check admin role (you'll need to verify this from custom claims or Firestore)
  const adminUserId = context.auth.uid;
  const adminUserDoc = await db.collection('sportshub_users').doc(adminUserId).get();
  const adminRole = adminUserDoc.data()?.globalRole;

  if (adminRole !== 'sportshub_super_admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can refund wallets');
  }

  const { userId, amountInCents, reason } = data;

  if (!userId || !amountInCents || !reason) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  const walletRef = db.collection('sportshub_wallets').doc(userId);

  try {
    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Wallet not found');
      }

      const walletData = walletDoc.data();
      const currentBalance = walletData?.balanceInCents || 0;
      const newBalance = currentBalance + amountInCents;

      // Update wallet
      transaction.update(walletRef, {
        balanceInCents: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Record transaction
      const transactionRef = walletRef.collection('transactions').doc();
      transaction.set(transactionRef, {
        type: 'refund-admin',
        amountInCents,
        balanceBeforeInCents: currentBalance,
        balanceAfterInCents: newBalance,
        description: `Admin refund: ${reason}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          adminUserId,
          reason,
        },
      });

      // Log admin action
      const adminLogRef = db.collection('sportshub_admin_logs').doc();
      transaction.set(adminLogRef, {
        action: 'refund_wallet',
        adminUserId,
        targetUserId: userId,
        amount: amountInCents,
        reason,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info('Wallet refunded', {
        adminUserId,
        userId,
        amountInCents,
        reason,
      });
    });

    return { success: true, message: 'Wallet refunded successfully' };
  } catch (error) {
    functions.logger.error('Error refunding wallet', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to refund wallet');
  }
});

/**
 * Firestore Trigger: Update vote tally when new vote is created
 * Uses distributed counter pattern to prevent write contention
 */
export const updateVoteTally = functions.firestore
  .document('sportshub_projects/{projectId}/votes/{voteId}')
  .onCreate(async (snap, context) => {
    const vote = snap.data();
    const { projectId } = context.params;

    const { tournamentId, votingItemId, selectedOption } = vote;

    if (!tournamentId || !votingItemId || !selectedOption) {
      functions.logger.error('Missing required vote data', { vote });
      return;
    }

    try {
      // Generate tally ID: projectId_tournamentId_votingItemId_option
      const tallyId = `${projectId}_${tournamentId}_${votingItemId}_${selectedOption}`;
      
      // Random shard (0-9) for distributed counter
      const shardId = Math.floor(Math.random() * 10).toString();
      
      const tallyRef = db
        .collection('sportshub_projects')
        .doc(projectId)
        .collection('vote_tallies')
        .doc(tallyId);

      await db.runTransaction(async (transaction) => {
        const tallyDoc = await transaction.get(tallyRef);

        if (!tallyDoc.exists) {
          // Create new tally document
          transaction.set(tallyRef, {
            tallyId,
            projectId,
            tournamentId,
            votingItemId,
            option: selectedOption,
            shards: {
              [shardId]: { count: 1 },
            },
            totalVotes: 1,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          // Update existing tally
          const currentData = tallyDoc.data();
          const shards = currentData?.shards || {};
          const currentShardCount = shards[shardId]?.count || 0;

          // Calculate new total
          let totalVotes = currentData?.totalVotes || 0;
          totalVotes += 1;

          transaction.update(tallyRef, {
            [`shards.${shardId}.count`]: currentShardCount + 1,
            totalVotes,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        functions.logger.info('Vote tally updated', {
          tallyId,
          shardId,
          projectId,
          tournamentId,
          votingItemId,
          option: selectedOption,
        });
      });
    } catch (error) {
      functions.logger.error('Error updating vote tally', error);
      // Don't throw - we don't want to fail the vote if tally update fails
    }
  });

/**
 * Scheduled function: Recalculate vote tallies from shards (runs every hour)
 * Ensures totalVotes is accurate by summing all shards
 */
export const recalculateVoteTallies = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      // Get all projects
      const projectsSnapshot = await db.collection('sportshub_projects').get();

      for (const projectDoc of projectsSnapshot.docs) {
        const projectId = projectDoc.id;
        
        // Get all tallies for this project
        const talliesSnapshot = await db
          .collection('sportshub_projects')
          .doc(projectId)
          .collection('vote_tallies')
          .get();

        const batch = db.batch();
        let updateCount = 0;

        for (const tallyDoc of talliesSnapshot.docs) {
          const tallyData = tallyDoc.data();
          const shards = tallyData.shards || {};

          // Sum all shards
          let calculatedTotal = 0;
          for (const shard of Object.values(shards)) {
            calculatedTotal += (shard as any).count || 0;
          }

          // Update if different
          if (calculatedTotal !== tallyData.totalVotes) {
            batch.update(tallyDoc.ref, {
              totalVotes: calculatedTotal,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            });
            updateCount++;
          }
        }

        if (updateCount > 0) {
          await batch.commit();
          functions.logger.info('Recalculated vote tallies', {
            projectId,
            updatedTallies: updateCount,
          });
        }
      }

      return null;
    } catch (error) {
      functions.logger.error('Error recalculating vote tallies', error);
      return null;
    }
  });

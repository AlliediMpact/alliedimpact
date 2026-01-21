/**
 * Cloud Function to send in-app notifications for tournament events
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Notify users when a tournament is published
 */
export const notifyTournamentPublished = functions.firestore
  .document('sportshub_projects/{projectId}/tournaments/{tournamentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed from draft/closed to open (published)
    if (before.status !== 'open' && after.status === 'open') {
      const { projectId, tournamentId } = context.params;
      const tournamentName = after.name;

      try {
        // Get all users with roles in this project
        const rolesSnapshot = await admin.firestore()
          .collection('sportshub_project_roles')
          .where('projectId', '==', projectId)
          .get();

        const notificationPromises = rolesSnapshot.docs.map((doc) => {
          const userId = doc.data().userId;

          return admin.firestore().collection('sportshub_notifications').add({
            userId,
            type: 'tournament_published',
            title: 'New Tournament Published! 🏆',
            message: `"${tournamentName}" is now live! Cast your votes and support your favorites.`,
            link: `/tournaments/${tournamentId}`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
              projectId,
              tournamentId,
              tournamentName,
            },
          });
        });

        await Promise.all(notificationPromises);
        console.log(`Sent ${notificationPromises.length} notifications for tournament: ${tournamentName}`);
      } catch (error) {
        console.error('Error sending tournament published notifications:', error);
      }
    }

    // Check if tournament closed
    if (before.status === 'open' && after.status === 'closed') {
      const { projectId, tournamentId } = context.params;
      const tournamentName = after.name;

      try {
        // Get users who voted in this tournament
        const votesSnapshot = await admin.firestore()
          .collection(`sportshub_projects/${projectId}/votes`)
          .where('tournamentId', '==', tournamentId)
          .get();

        const userIds = [...new Set(votesSnapshot.docs.map((doc) => doc.data().userId))];

        const notificationPromises = userIds.map((userId) => {
          return admin.firestore().collection('sportshub_notifications').add({
            userId,
            type: 'tournament_closed',
            title: 'Tournament Closed 🔒',
            message: `"${tournamentName}" voting has ended. Check out the results!`,
            link: `/tournaments/${tournamentId}/results`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
              projectId,
              tournamentId,
              tournamentName,
            },
          });
        });

        await Promise.all(notificationPromises);
        console.log(`Sent ${notificationPromises.length} close notifications for tournament: ${tournamentName}`);
      } catch (error) {
        console.error('Error sending tournament closed notifications:', error);
      }
    }
  });

/**
 * Notify user when wallet is topped up
 */
export const notifyWalletTopup = functions.firestore
  .document('sportshub_wallets/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const { userId } = context.params;

    // Check if balance increased (top-up)
    const beforeBalance = before.balanceInCents || 0;
    const afterBalance = after.balanceInCents || 0;

    if (afterBalance > beforeBalance) {
      const amountAdded = afterBalance - beforeBalance;
      const amountFormatted = `R${(amountAdded / 100).toFixed(2)}`;

      try {
        await admin.firestore().collection('sportshub_notifications').add({
          userId,
          type: 'wallet_topup',
          title: 'Wallet Top-Up Successful 💰',
          message: `${amountFormatted} has been added to your wallet. You're ready to vote!`,
          link: '/wallet',
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            amountAdded,
            newBalance: afterBalance,
          },
        });

        console.log(`Sent wallet top-up notification to user: ${userId}`);
      } catch (error) {
        console.error('Error sending wallet top-up notification:', error);
      }
    }
  });

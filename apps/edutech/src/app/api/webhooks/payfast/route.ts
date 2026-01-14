/**
 * API Route: PayFast Webhook Handler
 * 
 * Receives ITN (Instant Transaction Notification) from PayFast
 * Process: PayFast -> Webhook -> Update Subscription -> Send Email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayFastService } from '@/services/paymentService';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getEmailService } from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    // Parse POST data
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('PayFast ITN received:', data);

    // Validate signature
    const payfastService = getPayFastService();
    const validation = await payfastService.processITN(data);

    if (!validation.valid) {
      console.error('Invalid PayFast signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Extract payment details
    const { paymentStatus, userId, amount, paymentId } = validation;

    if (!userId) {
      console.error('No userId in payment data');
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Handle payment status
    switch (paymentStatus) {
      case 'COMPLETE':
        await handleSuccessfulPayment(userId, amount!, paymentId!);
        break;
      
      case 'FAILED':
      case 'CANCELLED':
        await handleFailedPayment(userId, amount!, paymentStatus);
        break;
      
      default:
        console.log(`Unhandled payment status: ${paymentStatus}`);
    }

    // Return 200 OK to PayFast
    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('PayFast webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(userId: string, amount: number, paymentId: string) {
  const db = getFirestore();
  const userRef = doc(db, 'edutech_users', userId);

  try {
    // Get user data
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User not found: ${userId}`);
    }

    const userData = userSnap.data();

    // Update subscription status
    await updateDoc(userRef, {
      'products.edutech.tier': 'PREMIUM',
      'products.edutech.active': true,
      'products.edutech.trialEndsAt': null, // Clear trial
      'products.edutech.subscriptionStartedAt': new Date(),
      'products.edutech.lastPaymentAt': new Date(),
      'products.edutech.lastPaymentAmount': amount,
      'products.edutech.lastPaymentId': paymentId,
      updatedAt: new Date(),
    });

    console.log(`✅ Subscription activated for user ${userId}`);

    // Send confirmation email
    const emailService = getEmailService();
    await emailService.sendPaymentSuccess(
      { email: userData.email, name: userData.displayName },
      amount,
      `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`
    );

  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(userId: string, amount: number, reason: string) {
  const db = getFirestore();
  const userRef = doc(db, 'edutech_users', userId);

  try {
    // Get user data
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error(`User not found: ${userId}`);
    }

    const userData = userSnap.data();

    // Log failed payment (optional: store in separate collection)
    console.log(`❌ Payment failed for user ${userId}: ${reason}`);

    // Send failure email
    const emailService = getEmailService();
    await emailService.sendPaymentFailed(
      { email: userData.email, name: userData.displayName },
      amount,
      reason
    );

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

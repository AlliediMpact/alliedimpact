/**
 * PayFast Webhook Handler
 * 
 * Processes PayFast IPN (Instant Payment Notifications) for subscription payments.
 * Verifies signature and grants entitlements on successful payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayFastSignature, parsePayFastIPN } from '../../../lib/payfast';
import { grantSubscription } from '@allied-impact/entitlements';
import { Logger } from '@allied-impact/shared';
import { track } from '@allied-impact/shared';

const logger = new Logger('PayFastWebhook');

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    logger.info('PayFast IPN received', { paymentId: data.m_payment_id });

    // Verify signature
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    if (!passphrase) {
      logger.error('PayFast passphrase not configured');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    const isValid = verifyPayFastSignature(data, passphrase);
    if (!isValid) {
      logger.error('PayFast signature verification failed', { data });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse IPN data
    const ipnData = parsePayFastIPN(data);
    if (!ipnData) {
      logger.error('PayFast IPN parsing failed', { data });
      return NextResponse.json(
        { error: 'Invalid IPN data' },
        { status: 400 }
      );
    }

    // Handle payment status
    if (ipnData.paymentStatus === 'COMPLETE') {
      // Grant subscription entitlement
      await grantSubscription(
        ipnData.userId,
        ipnData.productId,
        ipnData.tierId,
        {
          provider: 'payfast',
          subscriptionId: ipnData.transactionId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: true
        }
      );

      // Track successful subscription
      await track(ipnData.userId, 'SUBSCRIPTION_COMPLETED', {
        productId: ipnData.productId,
        tierId: ipnData.tierId,
        provider: 'payfast',
        amount: ipnData.amount,
        transactionId: ipnData.transactionId
      });

      logger.info('PayFast subscription granted', {
        userId: ipnData.userId,
        productId: ipnData.productId,
        tierId: ipnData.tierId,
        transactionId: ipnData.transactionId
      });

    } else if (ipnData.paymentStatus === 'FAILED') {
      // Track failed payment
      await track(ipnData.userId, 'SUBSCRIPTION_FAILED', {
        productId: ipnData.productId,
        tierId: ipnData.tierId,
        provider: 'payfast',
        reason: 'payment_failed'
      });

      logger.warn('PayFast payment failed', {
        userId: ipnData.userId,
        productId: ipnData.productId,
        paymentId: ipnData.paymentId
      });

    } else if (ipnData.paymentStatus === 'CANCELLED') {
      // Track cancelled payment
      await track(ipnData.userId, 'SUBSCRIPTION_CANCELLED', {
        productId: ipnData.productId,
        tierId: ipnData.tierId,
        provider: 'payfast',
        reason: 'user_cancelled'
      });

      logger.info('PayFast payment cancelled', {
        userId: ipnData.userId,
        productId: ipnData.productId,
        paymentId: ipnData.paymentId
      });
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    logger.error('PayFast webhook processing failed', error);
    
    // Return 500 to trigger retry from PayFast
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing (we need raw body for signature verification)
export const config = {
  api: {
    bodyParser: false
  }
};

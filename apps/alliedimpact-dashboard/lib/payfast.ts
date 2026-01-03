/**
 * PayFast Payment Integration
 * 
 * Handles PayFast payment form generation and signature verification.
 * Used for South African ZAR payments.
 * 
 * @see https://developers.payfast.co.za/docs
 */

import crypto from 'crypto';
import { Logger } from '@allied-impact/shared';

const logger = new Logger('PayFast');

interface PayFastPaymentData {
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  tierId: string;
  tierName: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

interface PayFastFormData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description: string;
  subscription_type: string;
  billing_date: string;
  recurring_amount: string;
  frequency: string;
  cycles: string;
  signature: string;
}

/**
 * Generate PayFast payment form URL with signature
 */
export async function createPayFastPayment(data: PayFastPaymentData): Promise<string> {
  try {
    const {
      userId,
      userEmail,
      productId,
      productName,
      tierId,
      tierName,
      amount,
      returnUrl,
      cancelUrl,
      notifyUrl
    } = data;

    // Validate environment variables
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    if (!merchantId || !merchantKey || !passphrase) {
      throw new Error('PayFast credentials not configured');
    }

    // Generate unique payment ID
    const paymentId = `${userId}_${productId}_${tierId}_${Date.now()}`;

    // Calculate billing date (today + 30 days for first charge)
    const billingDate = new Date();
    billingDate.setDate(billingDate.getDate() + 30);
    const billingDateStr = billingDate.toISOString().split('T')[0];

    // Build form data (order matters for signature!)
    const formData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: userEmail.split('@')[0], // Use email prefix as name
      email_address: userEmail,
      m_payment_id: paymentId,
      amount: amount.toFixed(2),
      item_name: `${productName} - ${tierName}`,
      item_description: `Monthly subscription to ${productName} ${tierName} tier`,
      subscription_type: '1', // Subscription
      billing_date: billingDateStr,
      recurring_amount: amount.toFixed(2),
      frequency: '3', // Monthly
      cycles: '0' // Continuous until cancelled
    };

    // Generate signature
    const signature = generatePayFastSignature(formData, passphrase);
    formData.signature = signature;

    // Build payment URL
    const payfastUrl = process.env.NODE_ENV === 'production'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    const queryString = new URLSearchParams(formData).toString();
    const paymentUrl = `${payfastUrl}?${queryString}`;

    logger.info('PayFast payment created', {
      userId,
      productId,
      tierId,
      amount,
      paymentId
    });

    return paymentUrl;

  } catch (error) {
    logger.error('PayFast payment creation failed', error);
    throw error;
  }
}

/**
 * Generate MD5 signature for PayFast
 */
function generatePayFastSignature(
  data: Record<string, string>,
  passphrase: string
): string {
  // Build parameter string (alphabetically ordered, excluding signature)
  const params = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Append passphrase
  const signatureString = `${params}&passphrase=${encodeURIComponent(passphrase)}`;

  // Generate MD5 hash
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Verify PayFast IPN (Instant Payment Notification)
 */
export function verifyPayFastSignature(
  data: Record<string, string>,
  passphrase: string
): boolean {
  try {
    const receivedSignature = data.signature;
    if (!receivedSignature) {
      return false;
    }

    const generatedSignature = generatePayFastSignature(data, passphrase);
    return receivedSignature === generatedSignature;

  } catch (error) {
    logger.error('PayFast signature verification failed', error);
    return false;
  }
}

/**
 * Parse PayFast IPN data
 */
export interface PayFastIPNData {
  userId: string;
  productId: string;
  tierId: string;
  amount: number;
  paymentId: string;
  paymentStatus: 'COMPLETE' | 'FAILED' | 'CANCELLED';
  transactionId: string;
}

export function parsePayFastIPN(data: Record<string, string>): PayFastIPNData | null {
  try {
    const paymentId = data.m_payment_id;
    if (!paymentId) {
      return null;
    }

    // Extract user/product/tier from payment ID
    const parts = paymentId.split('_');
    if (parts.length < 4) {
      return null;
    }

    const [userId, productId, tierId] = parts;

    return {
      userId,
      productId,
      tierId,
      amount: parseFloat(data.amount_gross || '0'),
      paymentId,
      paymentStatus: data.payment_status === 'COMPLETE' ? 'COMPLETE' : 
                     data.payment_status === 'CANCELLED' ? 'CANCELLED' : 'FAILED',
      transactionId: data.pf_payment_id || ''
    };

  } catch (error) {
    logger.error('PayFast IPN parsing failed', error);
    return null;
  }
}

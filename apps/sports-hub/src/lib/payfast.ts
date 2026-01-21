import crypto from 'crypto';

/**
 * PayFast Integration Utilities
 * Handles payment signature generation and validation for PayFast gateway
 */

export interface PayFastPaymentData {
  // Merchant details
  merchant_id: string;
  merchant_key: string;
  
  // Transaction details
  amount: string; // Format: "50.00"
  item_name: string;
  item_description?: string;
  
  // Buyer details
  name_first?: string;
  name_last?: string;
  email_address: string;
  
  // Transaction options
  payment_method?: 'cc' | 'dc' | 'eft'; // credit card, debit card, EFT
  
  // URLs
  return_url: string;
  cancel_url: string;
  notify_url: string;
  
  // Custom fields (for tracking)
  custom_str1?: string; // userId
  custom_str2?: string; // transactionType (e.g., 'wallet_topup')
  custom_str3?: string; // Additional metadata
  custom_int1?: string; // Amount in cents
  
  // Email confirmations
  email_confirmation?: '0' | '1';
  confirmation_address?: string;
}

/**
 * Generate PayFast payment signature (MD5 hash)
 * https://developers.payfast.co.za/docs#step_2_submit_payment_request
 */
export function generatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  // Remove signature if present
  const { signature, ...dataWithoutSignature } = data;
  
  // Sort keys alphabetically and build parameter string
  const sortedKeys = Object.keys(dataWithoutSignature).sort();
  const paramString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(dataWithoutSignature[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  // Add passphrase if provided
  const stringToHash = passphrase ? `${paramString}&passphrase=${passphrase}` : paramString;
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

/**
 * Validate PayFast ITN (Instant Transaction Notification) signature
 */
export function validatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string
): boolean {
  const receivedSignature = data.signature;
  
  if (!receivedSignature) {
    return false;
  }
  
  const calculatedSignature = generatePayFastSignature(data, passphrase);
  
  return receivedSignature === calculatedSignature;
}

/**
 * Build PayFast payment request data
 */
export function buildPayFastPaymentData(
  userId: string,
  amountInCents: number,
  userEmail: string,
  userName: string
): PayFastPaymentData {
  const amountInRands = (amountInCents / 100).toFixed(2);
  
  const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3008';
  
  if (!merchantId || !merchantKey) {
    throw new Error('PayFast merchant credentials not configured');
  }
  
  return {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    amount: amountInRands,
    item_name: 'SportsHub Wallet Top-Up',
    item_description: `Add R${amountInRands} to your SportsHub wallet`,
    name_first: userName.split(' ')[0] || userName,
    name_last: userName.split(' ').slice(1).join(' ') || '',
    email_address: userEmail,
    return_url: `${appUrl}/wallet/success`,
    cancel_url: `${appUrl}/wallet/cancel`,
    notify_url: `${appUrl}/api/payfast/webhook`,
    custom_str1: userId,
    custom_str2: 'wallet_topup',
    custom_int1: amountInCents.toString(),
    email_confirmation: '1',
    confirmation_address: userEmail,
  };
}

/**
 * Get PayFast payment URL (sandbox or production)
 */
export function getPayFastUrl(): string {
  const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true';
  return isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

/**
 * Validate PayFast server IP (for webhook security)
 * https://developers.payfast.co.za/docs#ip_addresses
 */
export function isValidPayFastIP(ipAddress: string): boolean {
  const validIPs = [
    '197.97.145.144',
    '197.97.145.145',
    '197.97.145.146',
    '197.97.145.147',
    '197.97.145.148',
    '41.74.179.194',
    '41.74.179.195',
    '41.74.179.196',
    '41.74.179.197',
    '41.74.179.198',
    '41.74.179.199',
  ];
  
  // Allow localhost for development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return validIPs.includes(ipAddress);
}

/**
 * Format amount for display
 */
export function formatAmount(amountInCents: number): string {
  return `R${(amountInCents / 100).toFixed(2)}`;
}

/**
 * Validate top-up amount (minimum R10, no maximum)
 */
export function validateTopUpAmount(amountInCents: number): { valid: boolean; error?: string } {
  const MIN_AMOUNT = 1000; // R10.00
  
  if (amountInCents < MIN_AMOUNT) {
    return {
      valid: false,
      error: `Minimum top-up amount is ${formatAmount(MIN_AMOUNT)}`,
    };
  }
  
  if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
    return {
      valid: false,
      error: 'Invalid amount',
    };
  }
  
  return { valid: true };
}

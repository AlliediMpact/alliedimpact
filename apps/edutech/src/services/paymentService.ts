/**
 * PayFast Payment Integration Service
 * 
 * Handles subscription payments via PayFast (South African payment gateway)
 * Documentation: https://developers.payfast.co.za/
 */

import crypto from 'crypto';

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  sandbox: boolean;
}

export interface PayFastPaymentData {
  // Merchant details
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;

  // Buyer details
  name_first: string;
  name_last: string;
  email_address: string;

  // Transaction details
  m_payment_id: string; // Unique payment ID from your system
  amount: string;
  item_name: string;
  item_description?: string;

  // Subscription details (for recurring)
  subscription_type?: '1' | '2'; // 1 = monthly, 2 = annually
  billing_date?: string; // YYYY-MM-DD
  recurring_amount?: string;
  frequency?: '3' | '6'; // 3 = monthly, 6 = annually
  cycles?: string; // 0 = continuous

  // Custom fields
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: string;
  custom_int2?: string;

  // Security
  signature?: string;
}

export class PayFastService {
  private config: PayFastConfig;
  private baseUrl: string;

  constructor(config: PayFastConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  /**
   * Generate payment signature for security
   */
  private generateSignature(data: Record<string, string>): string {
    // Create parameter string
    const paramString = Object.keys(data)
      .filter(key => key !== 'signature') // Exclude signature itself
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');

    // Append passphrase if in production
    const stringToHash = this.config.sandbox 
      ? paramString 
      : `${paramString}&passphrase=${encodeURIComponent(this.config.passphrase)}`;

    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToHash).digest('hex');
  }

  /**
   * Create one-time payment data
   */
  createPayment(params: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    itemName: string;
    itemDescription?: string;
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
  }): PayFastPaymentData {
    const paymentData: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      notify_url: params.notifyUrl,
      name_first: params.firstName,
      name_last: params.lastName,
      email_address: params.email,
      m_payment_id: `${params.userId}-${Date.now()}`,
      amount: params.amount.toFixed(2),
      item_name: params.itemName,
      item_description: params.itemDescription,
      custom_str1: params.userId, // Store user ID for webhook
    };

    // Generate signature
    paymentData.signature = this.generateSignature(paymentData as Record<string, string>);

    return paymentData;
  }

  /**
   * Create recurring subscription payment
   */
  createSubscription(params: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    itemName: string;
    billingDate: Date;
    frequency: 'monthly' | 'annually';
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
  }): PayFastPaymentData {
    const paymentData: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      notify_url: params.notifyUrl,
      name_first: params.firstName,
      name_last: params.lastName,
      email_address: params.email,
      m_payment_id: `sub-${params.userId}-${Date.now()}`,
      amount: params.amount.toFixed(2),
      item_name: params.itemName,
      item_description: `EduTech ${params.frequency === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
      
      // Subscription specific
      subscription_type: params.frequency === 'monthly' ? '1' : '2',
      billing_date: params.billingDate.toISOString().split('T')[0],
      recurring_amount: params.amount.toFixed(2),
      frequency: params.frequency === 'monthly' ? '3' : '6',
      cycles: '0', // Continuous until cancelled
      
      custom_str1: params.userId,
      custom_str2: params.frequency,
    };

    paymentData.signature = this.generateSignature(paymentData as Record<string, string>);

    return paymentData;
  }

  /**
   * Validate ITN (Instant Transaction Notification) from PayFast
   */
  validateITN(postData: Record<string, string>): boolean {
    const signature = postData['signature'];
    const dataWithoutSignature = { ...postData };
    delete dataWithoutSignature['signature'];

    const generatedSignature = this.generateSignature(dataWithoutSignature);
    
    return signature === generatedSignature;
  }

  /**
   * Get payment form HTML
   */
  getPaymentFormHTML(paymentData: PayFastPaymentData): string {
    const fields = Object.entries(paymentData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n    ');

    return `
<form action="${this.baseUrl}" method="post" id="payfast-form">
    ${fields}
    <button type="submit">Pay with PayFast</button>
</form>
<script>
  // Auto-submit form (optional)
  // document.getElementById('payfast-form').submit();
</script>
    `.trim();
  }

  /**
   * Process ITN webhook
   */
  async processITN(postData: Record<string, string>): Promise<{
    valid: boolean;
    paymentStatus: string;
    userId?: string;
    amount?: number;
    paymentId?: string;
  }> {
    // Validate signature
    if (!this.validateITN(postData)) {
      return { valid: false, paymentStatus: 'invalid_signature' };
    }

    // Extract data
    const paymentStatus = postData['payment_status'];
    const userId = postData['custom_str1'];
    const amount = parseFloat(postData['amount_gross']);
    const paymentId = postData['m_payment_id'];

    return {
      valid: true,
      paymentStatus,
      userId,
      amount,
      paymentId,
    };
  }
}

// Singleton instance
let payfastService: PayFastService | null = null;

export function getPayFastService(): PayFastService {
  if (!payfastService) {
    payfastService = new PayFastService({
      merchantId: process.env.PAYFAST_MERCHANT_ID || '',
      merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
      passphrase: process.env.PAYFAST_PASSPHRASE || '',
      sandbox: process.env.PAYFAST_SANDBOX === 'true',
    });
  }
  return payfastService;
}

/**
 * EduTech Subscription Pricing
 */
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    amount: 199, // R199/month
    name: 'EduTech Monthly Subscription',
    description: 'Full access to all courses and features',
    frequency: 'monthly' as const,
  },
  ANNUAL: {
    amount: 1999, // R1,999/year (save R389)
    name: 'EduTech Annual Subscription',
    description: 'Full access to all courses and features - 16% discount',
    frequency: 'annually' as const,
  },
};

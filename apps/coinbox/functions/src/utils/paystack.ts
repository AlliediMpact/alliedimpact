import axios from "axios";
import * as crypto from "crypto";
import { CONFIG } from "../config/constants";
import { PaystackWebhookPayload } from "../types";

/**
 * Paystack Integration Utility
 */

export class PaystackService {
  private static readonly BASE_URL = CONFIG.PAYSTACK.BASE_URL;
  private static readonly SECRET_KEY = CONFIG.PAYSTACK.SECRET_KEY;

  /**
   * Initialize a payment transaction
   */
  static async initializeTransaction(params: {
    email: string;
    amount: number;
    reference: string;
    metadata?: any;
    currency?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/transaction/initialize`,
        {
          email: params.email,
          amount: Math.round(params.amount * 100), // Convert to kobo
          reference: params.reference,
          metadata: params.metadata,
          currency: params.currency || "NGN",
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
        },
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || "Failed to initialize transaction");
    } catch (error: any) {
      console.error("Paystack initialization error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify a transaction
   */
  static async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || "Verification failed");
    } catch (error: any) {
      console.error("Paystack verification error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Create a transfer recipient
   */
  static async createTransferRecipient(params: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/transferrecipient`,
        {
          type: params.type,
          name: params.name,
          account_number: params.account_number,
          bank_code: params.bank_code,
          currency: params.currency || "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || "Failed to create recipient");
    } catch (error: any) {
      console.error("Paystack recipient creation error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Initiate a transfer (withdrawal)
   */
  static async initiateTransfer(params: {
    amount: number;
    recipient: string;
    reference: string;
    reason?: string;
    currency?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/transfer`,
        {
          source: "balance",
          amount: Math.round(params.amount * 100), // Convert to kobo
          recipient: params.recipient,
          reference: params.reference,
          reason: params.reason || "Wallet withdrawal",
          currency: params.currency || "NGN",
        },
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || "Transfer failed");
    } catch (error: any) {
      console.error("Paystack transfer error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", CONFIG.PAYSTACK.WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    return hash === signature;
  }

  /**
   * List banks
   */
  static async listBanks(country = "nigeria"): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/bank?country=${country}`,
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || "Failed to fetch banks");
    } catch (error: any) {
      console.error("Paystack banks list error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Resolve account number
   */
  static async resolveAccountNumber(
    accountNumber: string,
    bankCode: string
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.SECRET_KEY}`,
          },
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data.message || "Failed to resolve account");
    } catch (error: any) {
      console.error("Paystack account resolution error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Generate a unique payment reference
   */
  static generateReference(prefix = "PAY"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}

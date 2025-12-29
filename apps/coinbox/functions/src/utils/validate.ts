import { ValidationError } from "../types";
import { CONFIG, ERROR_CODES } from "../config/constants";

/**
 * Validation Utilities
 */

export class ValidationException extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationException";
    this.errors = errors;
  }
}

export const validate = {
  /**
   * Validate amount
   */
  amount: (amount: number, field = "amount"): ValidationError | null => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return {
        field,
        message: "Amount must be a valid number",
        code: ERROR_CODES.INVALID_AMOUNT,
      };
    }

    if (amount <= 0) {
      return {
        field,
        message: "Amount must be greater than 0",
        code: ERROR_CODES.AMOUNT_TOO_LOW,
      };
    }

    // Check decimal precision (max 8 decimal places for crypto)
    const decimalPlaces = (amount.toString().split(".")[1] || "").length;
    if (decimalPlaces > CONFIG.VALIDATION.MAX_AMOUNT_PRECISION) {
      return {
        field,
        message: `Amount cannot have more than ${CONFIG.VALIDATION.MAX_AMOUNT_PRECISION} decimal places`,
        code: ERROR_CODES.INVALID_AMOUNT,
      };
    }

    return null;
  },

  /**
   * Validate user ID
   */
  userId: (userId: string, field = "userId"): ValidationError | null => {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return {
        field,
        message: "User ID is required",
        code: ERROR_CODES.INVALID_INPUT,
      };
    }
    return null;
  },

  /**
   * Validate email
   */
  email: (email: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        field: "email",
        message: "Invalid email address",
        code: ERROR_CODES.INVALID_INPUT,
      };
    }
    return null;
  },

  /**
   * Validate trade amount for P2P
   */
  tradeAmount: (amount: number): ValidationError | null => {
    const amountError = validate.amount(amount);
    if (amountError) return amountError;

    if (amount < CONFIG.P2P.MIN_TRADE_AMOUNT) {
      return {
        field: "amount",
        message: `Minimum trade amount is ${CONFIG.P2P.MIN_TRADE_AMOUNT}`,
        code: ERROR_CODES.AMOUNT_TOO_LOW,
      };
    }

    if (amount > CONFIG.P2P.MAX_TRADE_AMOUNT) {
      return {
        field: "amount",
        message: `Maximum trade amount is ${CONFIG.P2P.MAX_TRADE_AMOUNT}`,
        code: ERROR_CODES.AMOUNT_TOO_HIGH,
      };
    }

    return null;
  },

  /**
   * Validate offer limits
   */
  offerLimits: (minLimit: number, maxLimit: number): ValidationError | null => {
    if (minLimit >= maxLimit) {
      return {
        field: "minLimit",
        message: "Minimum limit must be less than maximum limit",
        code: ERROR_CODES.INVALID_INPUT,
      };
    }

    if (minLimit < CONFIG.P2P.MIN_TRADE_AMOUNT) {
      return {
        field: "minLimit",
        message: `Minimum limit cannot be less than ${CONFIG.P2P.MIN_TRADE_AMOUNT}`,
        code: ERROR_CODES.AMOUNT_TOO_LOW,
      };
    }

    if (maxLimit > CONFIG.P2P.MAX_TRADE_AMOUNT) {
      return {
        field: "maxLimit",
        message: `Maximum limit cannot exceed ${CONFIG.P2P.MAX_TRADE_AMOUNT}`,
        code: ERROR_CODES.AMOUNT_TOO_HIGH,
      };
    }

    return null;
  },

  /**
   * Validate payment window
   */
  paymentWindow: (minutes: number): ValidationError | null => {
    if (minutes < CONFIG.P2P.MIN_PAYMENT_WINDOW || minutes > CONFIG.P2P.MAX_PAYMENT_WINDOW) {
      return {
        field: "paymentTimeWindow",
        message: `Payment window must be between ${CONFIG.P2P.MIN_PAYMENT_WINDOW} and ${CONFIG.P2P.MAX_PAYMENT_WINDOW} minutes`,
        code: ERROR_CODES.INVALID_INPUT,
      };
    }
    return null;
  },

  /**
   * Validate terms length
   */
  terms: (terms: string): ValidationError | null => {
    if (terms && terms.length > CONFIG.VALIDATION.MAX_TERMS_LENGTH) {
      return {
        field: "terms",
        message: `Terms cannot exceed ${CONFIG.VALIDATION.MAX_TERMS_LENGTH} characters`,
        code: ERROR_CODES.INVALID_INPUT,
      };
    }
    return null;
  },

  /**
   * Validate payment methods array
   */
  paymentMethods: (methods: string[]): ValidationError | null => {
    if (!Array.isArray(methods) || methods.length === 0) {
      return {
        field: "paymentMethods",
        message: "At least one payment method is required",
        code: ERROR_CODES.INVALID_INPUT,
      };
    }

    const validMethods = [
      "bank-transfer",
      "mobile-money",
      "paystack",
      "cash",
      "ussd",
      "card",
      "other",
    ];

    const invalidMethods = methods.filter((m) => !validMethods.includes(m));
    if (invalidMethods.length > 0) {
      return {
        field: "paymentMethods",
        message: `Invalid payment methods: ${invalidMethods.join(", ")}`,
        code: ERROR_CODES.INVALID_INPUT,
      };
    }

    return null;
  },

  /**
   * Run multiple validations
   */
  run: (validations: (ValidationError | null)[]): void => {
    const errors = validations.filter((v) => v !== null) as ValidationError[];
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  },
};

/**
 * Sanitize input data
 */
export const sanitize = {
  /**
   * Sanitize string input
   */
  string: (input: string, maxLength = 1000): string => {
    if (!input || typeof input !== "string") return "";
    return input.trim().slice(0, maxLength);
  },

  /**
   * Sanitize number input
   */
  number: (input: any, decimals = 2): number => {
    const num = parseFloat(input);
    if (isNaN(num)) return 0;
    return parseFloat(num.toFixed(decimals));
  },

  /**
   * Sanitize amount with precision
   */
  amount: (input: any, decimals = 2): number => {
    return sanitize.number(input, decimals);
  },
};

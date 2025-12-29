/**
 * Enhanced Error Messages and User Feedback
 * Provides clear, actionable error messages with recovery suggestions
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface EnhancedError {
  code: string;
  title: string;
  message: string;
  severity: ErrorSeverity;
  action?: {
    label: string;
    handler: () => void;
  };
  documentation?: string;
  retryable: boolean;
}

export class UserFeedbackService {
  private static errorMap: Record<string, Omit<EnhancedError, 'severity'>> = {
    // Authentication Errors
    'AUTH_001': {
      code: 'AUTH_001',
      title: 'Authentication Required',
      message: 'Please sign in to access this feature.',
      action: { label: 'Sign In', handler: () => window.location.href = '/login' },
      retryable: false,
    },
    'AUTH_002': {
      code: 'AUTH_002',
      title: 'Session Expired',
      message: 'Your session has expired. Please sign in again to continue.',
      action: { label: 'Sign In', handler: () => window.location.href = '/login' },
      retryable: false,
    },
    'AUTH_003': {
      code: 'AUTH_003',
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please try again.',
      retryable: true,
    },

    // API Errors
    'API_001': {
      code: 'API_001',
      title: 'Rate Limit Exceeded',
      message: 'You have made too many requests. Please wait a moment and try again.',
      documentation: '/docs/api/rate-limits',
      retryable: true,
    },
    'API_002': {
      code: 'API_002',
      title: 'Invalid API Key',
      message: 'The API key you provided is invalid or has been revoked.',
      action: { label: 'Manage Keys', handler: () => window.location.href = '/api-keys' },
      retryable: false,
    },
    'API_003': {
      code: 'API_003',
      title: 'Permission Denied',
      message: 'Your API key does not have permission to perform this action.',
      documentation: '/docs/api/permissions',
      retryable: false,
    },

    // Loan Errors
    'LOAN_001': {
      code: 'LOAN_001',
      title: 'Loan Limit Exceeded',
      message: 'This loan amount exceeds your tier limit. Upgrade your membership for higher limits.',
      action: { label: 'Upgrade', handler: () => window.location.href = '/membership' },
      retryable: false,
    },
    'LOAN_002': {
      code: 'LOAN_002',
      title: 'Invalid Loan Amount',
      message: 'Please enter a valid loan amount between R100 and your tier limit.',
      retryable: true,
    },
    'LOAN_003': {
      code: 'LOAN_003',
      title: 'Insufficient Documentation',
      message: 'Please provide all required documents to proceed with your loan application.',
      action: { label: 'Upload Documents', handler: () => window.location.href = '/documents' },
      retryable: false,
    },

    // Investment Errors
    'INV_001': {
      code: 'INV_001',
      title: 'Insufficient Balance',
      message: 'You do not have enough funds to make this investment. Please add funds to your wallet.',
      action: { label: 'Add Funds', handler: () => window.location.href = '/wallet/deposit' },
      retryable: false,
    },
    'INV_002': {
      code: 'INV_002',
      title: 'Ticket Not Available',
      message: 'This loan ticket is no longer available for investment.',
      retryable: false,
    },
    'INV_003': {
      code: 'INV_003',
      title: 'Investment Limit Reached',
      message: 'You have reached the maximum investment amount for this ticket.',
      retryable: false,
    },

    // Crypto Errors
    'CRYPTO_001': {
      code: 'CRYPTO_001',
      title: 'Order Value Too High',
      message: 'This crypto order exceeds your tier limit for P2P trading.',
      action: { label: 'Upgrade', handler: () => window.location.href = '/membership' },
      retryable: false,
    },
    'CRYPTO_002': {
      code: 'CRYPTO_002',
      title: 'Asset Not Available',
      message: 'This cryptocurrency is currently unavailable for trading.',
      retryable: false,
    },
    'CRYPTO_003': {
      code: 'CRYPTO_003',
      title: 'Price Changed',
      message: 'The price has changed since you started this transaction. Please review and confirm.',
      retryable: true,
    },

    // Bulk Operation Errors
    'BULK_001': {
      code: 'BULK_001',
      title: 'Batch Size Exceeded',
      message: 'You can only process up to 20 items per batch. Please split your request.',
      retryable: false,
    },
    'BULK_002': {
      code: 'BULK_002',
      title: 'Partial Batch Failure',
      message: 'Some items in your batch could not be processed. See details below.',
      retryable: false,
    },

    // Webhook Errors
    'WEBHOOK_001': {
      code: 'WEBHOOK_001',
      title: 'Invalid Webhook URL',
      message: 'Please provide a valid HTTPS URL for your webhook endpoint.',
      retryable: true,
    },
    'WEBHOOK_002': {
      code: 'WEBHOOK_002',
      title: 'Webhook Delivery Failed',
      message: 'We could not deliver the webhook to your endpoint. Please check your server.',
      action: { label: 'Retry', handler: () => {} }, // Handler set dynamically
      retryable: true,
    },

    // Network Errors
    'NET_001': {
      code: 'NET_001',
      title: 'Connection Failed',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      retryable: true,
    },
    'NET_002': {
      code: 'NET_002',
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      retryable: true,
    },

    // System Errors
    'SYS_001': {
      code: 'SYS_001',
      title: 'Service Unavailable',
      message: 'Our service is temporarily unavailable. Please try again in a few minutes.',
      retryable: true,
    },
    'SYS_002': {
      code: 'SYS_002',
      title: 'Maintenance Mode',
      message: 'We are currently performing maintenance. Service will be restored shortly.',
      retryable: false,
    },
  };

  static getError(code: string, severity: ErrorSeverity = 'error'): EnhancedError {
    const errorData = this.errorMap[code];
    
    if (!errorData) {
      return {
        code: 'UNKNOWN',
        title: 'An Error Occurred',
        message: 'Something went wrong. Please try again or contact support if the problem persists.',
        severity,
        retryable: true,
      };
    }

    return { ...errorData, severity };
  }

  static formatApiError(error: any): EnhancedError {
    // Handle Firestore errors
    if (error.code?.startsWith('firestore/')) {
      return this.getError('NET_001', 'error');
    }

    // Handle HTTP errors
    if (error.status) {
      switch (error.status) {
        case 401:
          return this.getError('AUTH_001', 'error');
        case 403:
          return this.getError('API_003', 'error');
        case 429:
          return this.getError('API_001', 'warning');
        case 503:
          return this.getError('SYS_001', 'error');
        default:
          return this.getError('SYS_001', 'error');
      }
    }

    // Handle custom error codes
    if (error.code && this.errorMap[error.code]) {
      return this.getError(error.code, 'error');
    }

    return this.getError('UNKNOWN', 'error');
  }
}

// Success Messages
export const successMessages = {
  LOAN_CREATED: {
    title: 'Loan Created Successfully',
    message: 'Your loan ticket has been created and is now open for investments.',
    icon: '✅',
  },
  INVESTMENT_MADE: {
    title: 'Investment Successful',
    message: 'Your investment has been processed. You will receive returns upon loan completion.',
    icon: '💰',
  },
  API_KEY_CREATED: {
    title: 'API Key Created',
    message: 'Your new API key has been created. Make sure to copy it now—you won\'t see it again!',
    icon: '🔑',
  },
  WEBHOOK_SUBSCRIBED: {
    title: 'Webhook Configured',
    message: 'Your webhook has been set up and will receive events as they occur.',
    icon: '🔔',
  },
  BULK_COMPLETED: {
    title: 'Batch Processing Complete',
    message: 'All items in your batch have been processed successfully.',
    icon: '✨',
  },
  CRYPTO_ORDER_PLACED: {
    title: 'Order Placed',
    message: 'Your crypto order has been placed and is pending matching.',
    icon: '🚀',
  },
  PROFILE_UPDATED: {
    title: 'Profile Updated',
    message: 'Your profile information has been saved successfully.',
    icon: '👤',
  },
  PASSWORD_CHANGED: {
    title: 'Password Changed',
    message: 'Your password has been updated. Please sign in with your new password.',
    icon: '🔒',
  },
};

// Loading Messages
export const loadingMessages = {
  CREATING_LOAN: 'Creating your loan ticket...',
  PROCESSING_INVESTMENT: 'Processing your investment...',
  LOADING_TICKETS: 'Loading loan tickets...',
  VALIDATING_DATA: 'Validating your information...',
  UPLOADING_FILE: 'Uploading file...',
  PROCESSING_BATCH: 'Processing batch operation...',
  GENERATING_KEY: 'Generating API key...',
  SENDING_REQUEST: 'Sending request...',
  FETCHING_DATA: 'Fetching data...',
};

// Info Messages
export const infoMessages = {
  BETA_FEATURE: {
    title: 'Beta Feature',
    message: 'This feature is currently in beta. Please report any issues you encounter.',
    icon: 'ℹ️',
  },
  API_LIMITS: {
    title: 'API Rate Limits',
    message: 'Your current tier allows {limit} requests per minute. Upgrade for higher limits.',
    icon: 'ℹ️',
  },
  SECURITY_TIP: {
    title: 'Security Tip',
    message: 'Never share your API keys or passwords with anyone.',
    icon: '🔐',
  },
};

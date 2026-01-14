/**
 * Error Handling Infrastructure
 * 
 * Provides unified error handling with user-friendly messages,
 * error codes, and structured logging for the EduTech platform.
 */

export enum ErrorCode {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  
  // Course Errors
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  COURSE_ALREADY_ENROLLED = 'COURSE_ALREADY_ENROLLED',
  COURSE_ENROLLMENT_FAILED = 'COURSE_ENROLLMENT_FAILED',
  COURSE_ACCESS_DENIED = 'COURSE_ACCESS_DENIED',
  COURSE_CREATION_FAILED = 'COURSE_CREATION_FAILED',
  COURSE_UPDATE_FAILED = 'COURSE_UPDATE_FAILED',
  
  // Subscription Errors
  SUBSCRIPTION_TRIAL_ALREADY_USED = 'SUBSCRIPTION_TRIAL_ALREADY_USED',
  SUBSCRIPTION_ACTIVATION_FAILED = 'SUBSCRIPTION_ACTIVATION_FAILED',
  SUBSCRIPTION_PAYMENT_FAILED = 'SUBSCRIPTION_PAYMENT_FAILED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  
  // Class Management Errors
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  CLASS_CREATION_FAILED = 'CLASS_CREATION_FAILED',
  CLASS_ACCESS_DENIED = 'CLASS_ACCESS_DENIED',
  CLASS_FULL = 'CLASS_FULL',
  
  // Facilitator Errors
  FACILITATOR_NOT_FOUND = 'FACILITATOR_NOT_FOUND',
  FACILITATOR_UNAUTHORIZED = 'FACILITATOR_UNAUTHORIZED',
  ATTENDANCE_ALREADY_MARKED = 'ATTENDANCE_ALREADY_MARKED',
  
  // Forum Errors
  FORUM_POST_NOT_FOUND = 'FORUM_POST_NOT_FOUND',
  FORUM_POST_CREATION_FAILED = 'FORUM_POST_CREATION_FAILED',
  FORUM_RATE_LIMIT_EXCEEDED = 'FORUM_RATE_LIMIT_EXCEEDED',
  
  // Progress Errors
  PROGRESS_UPDATE_FAILED = 'PROGRESS_UPDATE_FAILED',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  LESSON_ACCESS_DENIED = 'LESSON_ACCESS_DENIED',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  
  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  
  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * User-friendly error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password must be at least 8 characters long.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You do not have permission to perform this action.',
  
  // Courses
  [ErrorCode.COURSE_NOT_FOUND]: 'Course not found. It may have been removed.',
  [ErrorCode.COURSE_ALREADY_ENROLLED]: 'You are already enrolled in this course.',
  [ErrorCode.COURSE_ENROLLMENT_FAILED]: 'Unable to enroll in this course. Please try again.',
  [ErrorCode.COURSE_ACCESS_DENIED]: 'This course requires an active subscription.',
  [ErrorCode.COURSE_CREATION_FAILED]: 'Unable to create course. Please try again.',
  [ErrorCode.COURSE_UPDATE_FAILED]: 'Unable to update course. Please try again.',
  
  // Subscriptions
  [ErrorCode.SUBSCRIPTION_TRIAL_ALREADY_USED]: 'You have already used your free trial.',
  [ErrorCode.SUBSCRIPTION_ACTIVATION_FAILED]: 'Unable to activate subscription. Please contact support.',
  [ErrorCode.SUBSCRIPTION_PAYMENT_FAILED]: 'Payment failed. Please check your payment details.',
  [ErrorCode.SUBSCRIPTION_NOT_FOUND]: 'No subscription found for your account.',
  [ErrorCode.SUBSCRIPTION_EXPIRED]: 'Your subscription has expired. Please renew to continue.',
  
  // Classes
  [ErrorCode.CLASS_NOT_FOUND]: 'Class not found.',
  [ErrorCode.CLASS_CREATION_FAILED]: 'Unable to create class. Please try again.',
  [ErrorCode.CLASS_ACCESS_DENIED]: 'You do not have access to this class.',
  [ErrorCode.CLASS_FULL]: 'This class is full. Please contact your administrator.',
  
  // Facilitators
  [ErrorCode.FACILITATOR_NOT_FOUND]: 'Facilitator not found.',
  [ErrorCode.FACILITATOR_UNAUTHORIZED]: 'You are not authorized to access this class.',
  [ErrorCode.ATTENDANCE_ALREADY_MARKED]: 'Attendance has already been marked for this session.',
  
  // Forum
  [ErrorCode.FORUM_POST_NOT_FOUND]: 'Post not found. It may have been deleted.',
  [ErrorCode.FORUM_POST_CREATION_FAILED]: 'Unable to create post. Please try again.',
  [ErrorCode.FORUM_RATE_LIMIT_EXCEEDED]: 'You are posting too frequently. Please wait a few minutes.',
  
  // Progress
  [ErrorCode.PROGRESS_UPDATE_FAILED]: 'Unable to save your progress. Please try again.',
  [ErrorCode.LESSON_NOT_FOUND]: 'Lesson not found.',
  [ErrorCode.LESSON_ACCESS_DENIED]: 'You must complete previous lessons first.',
  
  // Network
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your internet connection.',
  [ErrorCode.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.NETWORK_OFFLINE]: 'You are offline. Some features may not be available.',
  
  // Validation
  [ErrorCode.VALIDATION_FAILED]: 'Please check your input and try again.',
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'This field is required.',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid format. Please check your input.',
  
  // Generic
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please slow down.',
};

/**
 * Custom error class for EduTech platform
 */
export class EduTechError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly technicalDetails?: any;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    code: ErrorCode,
    userMessage?: string,
    technicalDetails?: any,
    retryable = false
  ) {
    super(userMessage || ERROR_MESSAGES[code]);
    this.name = 'EduTechError';
    this.code = code;
    this.userMessage = userMessage || ERROR_MESSAGES[code];
    this.technicalDetails = technicalDetails;
    this.timestamp = new Date();
    this.retryable = retryable;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EduTechError);
    }
  }

  /**
   * Convert error to JSON for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      technicalDetails: this.technicalDetails,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

/**
 * Convert unknown errors to EduTechError
 */
export function normalizeError(error: unknown): EduTechError {
  if (error instanceof EduTechError) {
    return error;
  }

  if (error instanceof Error) {
    // Map Firebase Auth errors
    if (error.message.includes('auth/user-not-found')) {
      return new EduTechError(ErrorCode.AUTH_USER_NOT_FOUND, undefined, error);
    }
    if (error.message.includes('auth/wrong-password')) {
      return new EduTechError(ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, error);
    }
    if (error.message.includes('auth/email-already-in-use')) {
      return new EduTechError(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS, undefined, error);
    }
    if (error.message.includes('auth/weak-password')) {
      return new EduTechError(ErrorCode.AUTH_WEAK_PASSWORD, undefined, error);
    }

    // Map network errors
    if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
      return new EduTechError(ErrorCode.NETWORK_ERROR, undefined, error, true);
    }

    // Generic error
    return new EduTechError(ErrorCode.UNKNOWN_ERROR, error.message, error);
  }

  // Unknown error type
  return new EduTechError(
    ErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred',
    error
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof EduTechError) {
    return error.retryable;
  }
  
  // Network errors are generally retryable
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('Failed to fetch')
    );
  }
  
  return false;
}

/**
 * Log error to console (development) or monitoring service (production)
 */
export function logError(error: EduTechError, context?: Record<string, any>) {
  const errorLog = {
    ...error.toJSON(),
    context,
    environment: process.env.NODE_ENV,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('EduTech Error:', errorLog);
  } else {
    // TODO: Send to Sentry or other monitoring service
    console.error('EduTech Error:', error.code, error.userMessage);
  }
}

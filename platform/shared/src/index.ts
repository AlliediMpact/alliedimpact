/**
 * @allied-impact/shared
 * 
 * Shared utilities and helpers used across all Allied iMpact services.
 */

import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

let firebaseApp: FirebaseApp | null = null;

/**
 * Initialize Firebase for the platform
 */
export function initializeFirebase(config: FirebaseOptions): FirebaseApp {
  if (!getApps().length) {
    firebaseApp = initializeApp(config);
  } else {
    firebaseApp = getApps()[0];
  }
  
  return firebaseApp;
}

/**
 * Get Firebase app instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return firebaseApp;
}

/**
 * Get Firestore instance
 */
export function getFirestoreInstance(): Firestore {
  return getFirestore(getFirebaseApp());
}

/**
 * Get Storage instance
 */
export function getStorageInstance(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

/**
 * Get Functions instance
 */
export function getFunctionsInstance(): Functions {
  return getFunctions(getFirebaseApp());
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class AlliedImpactError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AlliedImpactError';
  }
}

export class AuthenticationError extends AlliedImpactError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AlliedImpactError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AlliedImpactError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AlliedImpactError {
  constructor(resource: string = 'Resource', details?: any) {
    super(`${resource} not found`, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AlliedImpactError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Handle errors and format response
 */
export function handleError(error: any): {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
} {
  if (error instanceof AlliedImpactError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      statusCode: error.statusCode
    };
  }
  
  // Firebase errors
  if (error.code?.startsWith('auth/')) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      statusCode: 401
    };
  }
  
  // Unknown errors
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    statusCode: 500
  };
}

// ============================================================================
// LOGGING
// ============================================================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  userId?: string;
  productId?: string;
  action?: string;
  [key: string]: any;
}

export class Logger {
  constructor(private service: string) {}
  
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.service,
      message,
      ...context
    };
    
    // In production, send to logging service (e.g., Google Cloud Logging)
    // For now, console log with formatting
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
  
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
}

export function createLogger(service: string): Logger {
  return new Logger(service);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  // South African phone number format
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && Number.isFinite(amount);
}

export function validateCurrency(currency: string): boolean {
  const validCurrencies = ['ZAR', 'USD', 'EUR', 'GBP'];
  return validCurrencies.includes(currency.toUpperCase());
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount);
}

export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
      
    case 'long':
      return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
    case 'iso':
      return date.toISOString();
      
    default:
      return date.toString();
  }
}

export function formatPhoneNumber(phone: string): string {
  // Format: +27 82 123 4567
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('27')) {
    return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.startsWith('0')) {
    return `0${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

export function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  
  async function attempt(attemptNumber: number): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attemptNumber >= maxAttempts) {
        throw error;
      }
      
      const waitTime = backoff ? delay * Math.pow(2, attemptNumber - 1) : delay;
      await sleep(waitTime);
      
      return attempt(attemptNumber + 1);
    }
  }
  
  return attempt(1);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Firebase
  initializeFirebase,
  getFirebaseApp,
  getFirestoreInstance,
  getStorageInstance,
  getFunctionsInstance,
  
  // Errors
  AlliedImpactError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  handleError,
  
  // Logging
  createLogger,
  Logger,
  
  // Validation
  validateEmail,
  validatePhoneNumber,
  validateAmount,
  validateCurrency,
  
  // Formatting
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  
  // Utilities
  generateId,
  sleep,
  chunk,
  retry
};

// Export user archetypes
export * from './user-archetypes';

// Export product categories
export * from './product-categories';

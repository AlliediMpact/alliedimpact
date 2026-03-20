/**
 * @allied-impact/shared
 *
 * Shared utilities and helpers used across all Allied iMpact services.
 */
import { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Functions } from 'firebase/functions';
/**
 * Initialize Firebase for the platform
 */
export declare function initializeFirebase(config: FirebaseOptions): FirebaseApp;
/**
 * Get Firebase app instance
 */
export declare function getFirebaseApp(): FirebaseApp;
/**
 * Get Firestore instance
 */
export declare function getFirestoreInstance(): Firestore;
/**
 * Get Storage instance
 */
export declare function getStorageInstance(): FirebaseStorage;
/**
 * Get Functions instance
 */
export declare function getFunctionsInstance(): Functions;
export declare class AlliedImpactError extends Error {
    code: string;
    statusCode: number;
    details?: any | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: any | undefined);
}
export declare class AuthenticationError extends AlliedImpactError {
    constructor(message?: string, details?: any);
}
export declare class AuthorizationError extends AlliedImpactError {
    constructor(message?: string, details?: any);
}
export declare class ValidationError extends AlliedImpactError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AlliedImpactError {
    constructor(resource?: string, details?: any);
}
export declare class ConflictError extends AlliedImpactError {
    constructor(message: string, details?: any);
}
/**
 * Handle errors and format response
 */
export declare function handleError(error: any): {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    statusCode: number;
};
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export interface LogContext {
    userId?: string;
    productId?: string;
    action?: string;
    [key: string]: any;
}
export declare class Logger {
    private service;
    constructor(service: string);
    private log;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
}
export declare function createLogger(service: string): Logger;
export declare function validateEmail(email: string): boolean;
export declare function validatePhoneNumber(phone: string): boolean;
export declare function validateAmount(amount: number): boolean;
export declare function validateCurrency(currency: string): boolean;
export declare function formatCurrency(amount: number, currency?: string): string;
export declare function formatDate(date: Date, format?: 'short' | 'long' | 'iso'): string;
export declare function formatPhoneNumber(phone: string): string;
export declare function generateId(prefix?: string): string;
export declare function sleep(ms: number): Promise<void>;
export declare function chunk<T>(array: T[], size: number): T[][];
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
}): Promise<T>;
declare const _default: {
    initializeFirebase: typeof initializeFirebase;
    getFirebaseApp: typeof getFirebaseApp;
    getFirestoreInstance: typeof getFirestoreInstance;
    getStorageInstance: typeof getStorageInstance;
    getFunctionsInstance: typeof getFunctionsInstance;
    AlliedImpactError: typeof AlliedImpactError;
    AuthenticationError: typeof AuthenticationError;
    AuthorizationError: typeof AuthorizationError;
    ValidationError: typeof ValidationError;
    NotFoundError: typeof NotFoundError;
    ConflictError: typeof ConflictError;
    handleError: typeof handleError;
    createLogger: typeof createLogger;
    Logger: typeof Logger;
    validateEmail: typeof validateEmail;
    validatePhoneNumber: typeof validatePhoneNumber;
    validateAmount: typeof validateAmount;
    validateCurrency: typeof validateCurrency;
    formatCurrency: typeof formatCurrency;
    formatDate: typeof formatDate;
    formatPhoneNumber: typeof formatPhoneNumber;
    generateId: typeof generateId;
    sleep: typeof sleep;
    chunk: typeof chunk;
    retry: typeof retry;
};
export default _default;
export * from './user-archetypes';
export * from './product-categories';
//# sourceMappingURL=index.d.ts.map
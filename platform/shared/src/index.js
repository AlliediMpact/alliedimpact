"use strict";
/**
 * @allied-impact/shared
 *
 * Shared utilities and helpers used across all Allied iMpact services.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.AuthorizationError = exports.AuthenticationError = exports.AlliedImpactError = void 0;
exports.initializeFirebase = initializeFirebase;
exports.getFirebaseApp = getFirebaseApp;
exports.getFirestoreInstance = getFirestoreInstance;
exports.getStorageInstance = getStorageInstance;
exports.getFunctionsInstance = getFunctionsInstance;
exports.handleError = handleError;
exports.createLogger = createLogger;
exports.validateEmail = validateEmail;
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateAmount = validateAmount;
exports.validateCurrency = validateCurrency;
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatPhoneNumber = formatPhoneNumber;
exports.generateId = generateId;
exports.sleep = sleep;
exports.chunk = chunk;
exports.retry = retry;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const functions_1 = require("firebase/functions");
let firebaseApp = null;
/**
 * Initialize Firebase for the platform
 */
function initializeFirebase(config) {
    if (!(0, app_1.getApps)().length) {
        firebaseApp = (0, app_1.initializeApp)(config);
    }
    else {
        firebaseApp = (0, app_1.getApps)()[0];
    }
    return firebaseApp;
}
/**
 * Get Firebase app instance
 */
function getFirebaseApp() {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase first.');
    }
    return firebaseApp;
}
/**
 * Get Firestore instance
 */
function getFirestoreInstance() {
    return (0, firestore_1.getFirestore)(getFirebaseApp());
}
/**
 * Get Storage instance
 */
function getStorageInstance() {
    return (0, storage_1.getStorage)(getFirebaseApp());
}
/**
 * Get Functions instance
 */
function getFunctionsInstance() {
    return (0, functions_1.getFunctions)(getFirebaseApp());
}
// ============================================================================
// ERROR HANDLING
// ============================================================================
class AlliedImpactError extends Error {
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AlliedImpactError';
    }
}
exports.AlliedImpactError = AlliedImpactError;
class AuthenticationError extends AlliedImpactError {
    constructor(message = 'Authentication required', details) {
        super(message, 'AUTH_ERROR', 401, details);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AlliedImpactError {
    constructor(message = 'Insufficient permissions', details) {
        super(message, 'AUTHORIZATION_ERROR', 403, details);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class ValidationError extends AlliedImpactError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AlliedImpactError {
    constructor(resource = 'Resource', details) {
        super(`${resource} not found`, 'NOT_FOUND', 404, details);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AlliedImpactError {
    constructor(message, details) {
        super(message, 'CONFLICT', 409, details);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/**
 * Handle errors and format response
 */
function handleError(error) {
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
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(service) {
        this.service = service;
    }
    log(level, message, context) {
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
        }
        else {
            console.log(JSON.stringify(logEntry));
        }
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    error(message, error, context) {
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
exports.Logger = Logger;
function createLogger(service) {
    return new Logger(service);
}
// ============================================================================
// VALIDATION HELPERS
// ============================================================================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePhoneNumber(phone) {
    // South African phone number format
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}
function validateAmount(amount) {
    return amount > 0 && Number.isFinite(amount);
}
function validateCurrency(currency) {
    const validCurrencies = ['ZAR', 'USD', 'EUR', 'GBP'];
    return validCurrencies.includes(currency.toUpperCase());
}
// ============================================================================
// FORMAT HELPERS
// ============================================================================
function formatCurrency(amount, currency = 'ZAR') {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency.toUpperCase()
    }).format(amount);
}
function formatDate(date, format = 'short') {
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
function formatPhoneNumber(phone) {
    // Format: +27 82 123 4567
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('27')) {
        return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    else if (cleaned.startsWith('0')) {
        return `0${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function generateId(prefix) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function chunk(array, size) {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
}
function retry(fn, options = {}) {
    const { maxAttempts = 3, delay = 1000, backoff = true } = options;
    async function attempt(attemptNumber) {
        try {
            return await fn();
        }
        catch (error) {
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
exports.default = {
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
__exportStar(require("./user-archetypes"), exports);
// Export product categories
__exportStar(require("./product-categories"), exports);
//# sourceMappingURL=index.js.map
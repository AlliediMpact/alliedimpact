/**
 * @allied-impact/utils
 * 
 * Utility functions used across all Allied iMpact applications.
 */

import { format, formatDistance, formatRelative, addDays, addMonths, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

export class DateUtils {
  /**
   * Format date to readable string
   */
  static format(date: Date | string, formatString: string = 'PPP'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  }
  
  /**
   * Get relative time (e.g., "2 days ago")
   */
  static relative(date: Date | string, baseDate: Date = new Date()): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, baseDate, { addSuffix: true });
  }
  
  /**
   * Get contextual relative time (e.g., "last Friday at 2:15 PM")
   */
  static contextualRelative(date: Date | string, baseDate: Date = new Date()): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, baseDate);
  }
  
  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }
  
  /**
   * Add months to date
   */
  static addMonths(date: Date, months: number): Date {
    return addMonths(date, months);
  }
  
  /**
   * Get difference in days
   */
  static daysDifference(date1: Date, date2: Date): number {
    return differenceInDays(date1, date2);
  }
  
  /**
   * Check if date is after another
   */
  static isAfter(date: Date, dateToCompare: Date): boolean {
    return isAfter(date, dateToCompare);
  }
  
  /**
   * Check if date is before another
   */
  static isBefore(date: Date, dateToCompare: Date): boolean {
    return isBefore(date, dateToCompare);
  }
  
  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  /**
   * Get start of day
   */
  static startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
  
  /**
   * Get end of day
   */
  static endOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export class StringUtils {
  /**
   * Capitalize first letter
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  /**
   * Convert to title case
   */
  static titleCase(str: string): string {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  /**
   * Convert to slug (URL-friendly string)
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Mask sensitive information (e.g., credit card, phone)
   */
  static mask(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (str.length <= visibleChars) return str;
    const masked = maskChar.repeat(str.length - visibleChars);
    return masked + str.slice(-visibleChars);
  }
  
  /**
   * Remove special characters
   */
  static removeSpecialChars(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
  }
  
  /**
   * Generate random string
   */
  static random(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export class NumberUtils {
  /**
   * Format currency (South African Rand by default)
   */
  static formatCurrency(amount: number, currency: string = 'ZAR', locale: string = 'en-ZA'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
  
  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }
  
  /**
   * Format with thousands separator
   */
  static formatWithCommas(value: number): string {
    return value.toLocaleString('en-ZA');
  }
  
  /**
   * Round to decimal places
   */
  static round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  
  /**
   * Calculate percentage
   */
  static percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }
  
  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Generate random number between min and max
   */
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export class ArrayUtils {
  /**
   * Remove duplicates from array
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }
  
  /**
   * Group array items by key
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
  
  /**
   * Sort array by key
   */
  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  }
  
  /**
   * Shuffle array randomly
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Get random item from array
   */
  static random<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

export class ObjectUtils {
  /**
   * Deep clone object
   */
  static clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * Check if object is empty
   */
  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }
  
  /**
   * Pick specific keys from object
   */
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }
  
  /**
   * Omit specific keys from object
   */
  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
  
  /**
   * Merge objects deeply
   */
  static merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    const result = { ...target };
    
    sources.forEach(source => {
      Object.keys(source).forEach(key => {
        const sourceValue = source[key as keyof T];
        const targetValue = result[key as keyof T];
        
        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          result[key as keyof T] = ObjectUtils.merge(targetValue, sourceValue);
        } else {
          result[key as keyof T] = sourceValue as T[keyof T];
        }
      });
    });
    
    return result;
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate South African phone number
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  /**
   * Validate South African ID number
   */
  static isValidSAIdNumber(idNumber: string): boolean {
    if (!/^\d{13}$/.test(idNumber)) return false;
    
    // Luhn algorithm for validation
    let sum = 0;
    let isSecondDigit = false;
    
    for (let i = idNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(idNumber[i]);
      
      if (isSecondDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isSecondDigit = !isSecondDigit;
    }
    
    return sum % 10 === 0;
  }
  
  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DateUtils,
  StringUtils,
  NumberUtils,
  ArrayUtils,
  ObjectUtils,
  ValidationUtils
};

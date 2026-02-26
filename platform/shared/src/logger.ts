/**
 * @allied-impact/shared - Logger Module
 * 
 * Simple logging utility for platform packages.
 * In production, only warnings and errors are logged.
 */

export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;
}

/**
 * Create a contextual logger instance
 * @param context - The context/module name for the logger
 */
export function createLogger(context: string): Logger {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    info: (message: string, ...args: any[]): void => {
      if (!isProduction) {
        console.log(`[${context}] ${message}`, ...args);
      }
    },
    
    warn: (message: string, ...args: any[]): void => {
      console.warn(`[${context}] ${message}`, ...args);
    },
    
    error: (message: string, error?: Error, ...args: any[]): void => {
      if (error) {
        console.error(`[${context}] ${message}`, error, ...args);
      } else {
        console.error(`[${context}] ${message}`, ...args);
      }
    },
  };
}

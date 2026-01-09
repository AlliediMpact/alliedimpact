/**
 * Production Logger
 * Structured logging utility for development and production environments
 * Ready for integration with error tracking services (Sentry, DataDog, etc.)
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} - ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const formattedMessage = this.formatMessage(level, message, context);

    // Console logging (always in development, conditional in production)
    if (this.isDevelopment || level === LogLevel.ERROR || level === LogLevel.WARN) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, error || '');
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, error || '');
          break;
      }
    }

    // TODO: Send to external logging service in production
    // if (!this.isDevelopment && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
    //   this.sendToExternalService(level, message, context, error);
    // }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Specialized methods for common use cases
  logAuthEvent(event: string, userId?: string, success: boolean = true) {
    this.info(`Auth: ${event}`, {
      userId,
      action: event,
      metadata: { success },
    });
  }

  logApiCall(endpoint: string, method: string, statusCode?: number, duration?: number) {
    const level = statusCode && statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API: ${method} ${endpoint}`, {
      action: 'api_call',
      metadata: { method, endpoint, statusCode, duration },
    });
  }

  logUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`User Action: ${action}`, {
      userId,
      action,
      metadata,
    });
  }

  logFirestoreOperation(
    operation: 'read' | 'write' | 'update' | 'delete',
    collection: string,
    documentId?: string,
    success: boolean = true
  ) {
    this.info(`Firestore ${operation}: ${collection}${documentId ? `/${documentId}` : ''}`, {
      action: `firestore_${operation}`,
      metadata: { collection, documentId, success },
    });
  }

  // Future integration point for external services
  private async sendToExternalService(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    // TODO: Implement Sentry, DataDog, or other service integration
    // Example for Sentry:
    // if (level === LogLevel.ERROR && error) {
    //   Sentry.captureException(error, {
    //     level: 'error',
    //     tags: {
    //       component: context?.component,
    //       userId: context?.userId,
    //     },
    //     extra: context?.metadata,
    //   });
    // }
  }
}

// Export singleton instance
export const logger = ProductionLogger.getInstance();

// Convenience exports
export default logger;

/**
 * Monitoring Infrastructure - Sentry Error Tracking
 *
 * This module configures Sentry for error tracking and performance monitoring.
 *
 * Features:
 * - Automatic error capture
 * - Performance monitoring
 * - User context tracking
 * - Breadcrumbs for debugging
 * - Source map support
 *
 * Security:
 * - PII filtering enabled
 * - Sensitive data scrubbing
 * - User IDs only (no emails in production)
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry (call this once in app startup)
 */
export function initializeSentry(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive information
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      // Filter out specific errors
      if (event.exception) {
        const errorMessage = event.exception.values?.[0]?.value || '';

        // Ignore common non-critical errors
        const ignorePatterns = [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'cancelled',
        ];

        if (ignorePatterns.some(pattern => errorMessage.includes(pattern))) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific URLs
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
    ],
  });

  console.log('✅ Sentry initialized');
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  name?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    // Only include email in development
    ...(process.env.NODE_ENV === 'development' && { email: user.email }),
    username: user.name,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture an exception
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): string {
  if (context) {
    Sentry.setContext('additional', context);
  }

  const eventId = Sentry.captureException(error);
  console.error('Error captured by Sentry:', eventId, error);
  return eventId;
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
): string {
  if (context) {
    Sentry.setContext('additional', context);
  }

  const eventId = Sentry.captureMessage(message, level);
  return eventId;
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  operationName?: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, {
        operation: operationName || fn.name,
        arguments: args,
      });
      throw error;
    }
  }) as T;
}

/**
 * Performance monitoring helpers
 */
export class PerformanceMonitor {
  private transaction: Sentry.Transaction | null = null;
  private spans: Map<string, Sentry.Span> = new Map();

  constructor(transactionName: string, op: string = 'function') {
    this.transaction = startTransaction(transactionName, op);
  }

  startSpan(name: string, op: string = 'operation'): void {
    if (!this.transaction) return;

    const span = this.transaction.startChild({
      op,
      description: name,
    });

    this.spans.set(name, span);
  }

  endSpan(name: string): void {
    const span = this.spans.get(name);
    if (span) {
      span.finish();
      this.spans.delete(name);
    }
  }

  finish(): void {
    // End all remaining spans
    this.spans.forEach(span => span.finish());
    this.spans.clear();

    // Finish transaction
    if (this.transaction) {
      this.transaction.finish();
      this.transaction = null;
    }
  }
}

/**
 * Test Sentry connection
 */
export function testSentryConnection(): boolean {
  try {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.warn('⚠️  Sentry DSN not configured');
      return false;
    }

    captureMessage('Sentry test message', 'info');
    console.log('✅ Sentry test message sent');
    return true;
  } catch (error) {
    console.error('❌ Sentry connection failed:', error);
    return false;
  }
}

// Common error tracking patterns
export const ErrorTracking = {
  /**
   * Track API errors
   */
  apiError: (endpoint: string, error: Error, statusCode?: number) => {
    captureException(error, {
      type: 'api_error',
      endpoint,
      statusCode,
    });
  },

  /**
   * Track database errors
   */
  databaseError: (operation: string, error: Error) => {
    captureException(error, {
      type: 'database_error',
      operation,
    });
  },

  /**
   * Track external service errors
   */
  externalServiceError: (service: string, operation: string, error: Error) => {
    captureException(error, {
      type: 'external_service_error',
      service,
      operation,
    });
  },

  /**
   * Track authentication errors
   */
  authError: (operation: string, error: Error) => {
    captureException(error, {
      type: 'auth_error',
      operation,
    });
  },
};

export default Sentry;

/**
 * Structured Logging & Correlation ID Helper
 * Ensures no credentials or tokens are ever logged.
 */

export interface LogContext {
  correlationId?: string;
  provider?: string;
  endpoint?: string;
  durationMs?: number;
  cached?: boolean;
  status?: number;
  [key: string]: unknown;
}

export class Logger {
  static generateId(): string {
    return 'req-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
  }

  static info(message: string, context: LogContext = {}) {
    this.log('INFO', message, context);
  }

  static warn(message: string, context: LogContext = {}) {
    this.log('WARN', message, context);
  }

  static error(message: string, error?: Error | unknown, context: LogContext = {}) {
    const errObj = error instanceof Error 
      ? { errorMessage: error.message, stack: error.stack }
      : { errorDetail: String(error) };
    this.log('ERROR', message, { ...context, ...errObj });
  }

  private static log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context: LogContext) {
    const sanitized = this.sanitize(context);
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...sanitized,
    };
    console.log(JSON.stringify(entry));
  }

  private static sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    const forbiddenKeys = ['secret', 'password', 'token', 'key', 'auth', 'authorization', 'bearer'];

    for (const [key, val] of Object.entries(obj)) {
      if (forbiddenKeys.some(fk => key.toLowerCase().includes(fk))) {
        clean[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        clean[key] = this.sanitize(val as Record<string, unknown>);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }
}

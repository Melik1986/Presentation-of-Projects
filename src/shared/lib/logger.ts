/* eslint-disable no-console */
/**
 * Simple structured logger inspired by Pino
 * Recommended by Next.js: https://nextjs.org/docs/13/pages/building-your-application/deploying/production-checklist#logging
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: number;
  time: number;
  msg?: string;
  pid?: number;
  hostname?: string;
  [key: string]: unknown;
}

interface LoggerOptions {
  level?: LogLevel;
  enabled?: boolean;
  base?: Record<string, unknown>;
}

interface ChildBindings {
  [key: string]: unknown;
}

const LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const isBrowser = typeof window !== 'undefined';

class Logger {
  private minLevel: number;
  private enabled: boolean;
  private _bindings: ChildBindings;

  constructor(options: LoggerOptions = {}, bindings: ChildBindings = {}) {
    this.minLevel = LEVELS[options.level ?? 'info'];
    this.enabled = options.enabled ?? process.env.NODE_ENV !== 'production';
    this._bindings = {
      ...options.base,
      ...bindings,
    };
  }

  /**
   * Create child logger with additional bindings
   * @param bindings - Context to add to all child logs
   */
  child(bindings: ChildBindings): Logger {
    return new Logger(
      { level: this.levelName, enabled: this.enabled },
      { ...this._bindings, ...bindings }
    );
  }

  /**
   * Get current bindings
   */
  bindings(): ChildBindings {
    return { ...this._bindings };
  }

  /**
   * Update bindings dynamically
   * @param bindings - New bindings to merge
   */
  setBindings(bindings: ChildBindings): void {
    Object.assign(this._bindings, bindings);
  }

  private get levelName(): LogLevel {
    const entry = Object.entries(LEVELS).find(([, value]) => value === this.minLevel);
    return (entry?.[0] as LogLevel) ?? 'info';
  }

  private shouldLog(level: number): boolean {
    return this.enabled && level >= this.minLevel;
  }

  private write(level: LogLevel, msgOrObj: string | object, ...args: unknown[]): void {
    if (!this.shouldLog(LEVELS[level])) return;

    const entry: LogEntry = {
      level: LEVELS[level],
      time: Date.now(),
      ...this._bindings,
    };

    // Handle different input styles (Pino-compatible)
    if (typeof msgOrObj === 'string') {
      entry.msg = msgOrObj;
      if (args.length > 0) {
        entry.data = args;
      }
    } else {
      Object.assign(entry, msgOrObj);
      if (typeof args[0] === 'string') {
        entry.msg = args[0];
        if (args.length > 1) {
          entry.data = args.slice(1);
        }
      }
    }

    // Browser: pretty console output
    if (isBrowser) {
      this.browserLog(level, entry);
    } else {
      // Server: JSON output (Pino-style)
      console.log(JSON.stringify(entry));
    }
  }

  private browserLog(level: LogLevel, entry: LogEntry): void {
    const consoleMethod = level === 'fatal' || level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    const emoji = { trace: '🔍', debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌', fatal: '💀' }[level];
    
    const { msg, level: _level, time, data, ...context } = entry;
    const timeStr = new Date(time).toISOString().split('T')[1]?.slice(0, -1);
    
    console[consoleMethod](
      `${emoji} [${timeStr}]`,
      msg ?? '',
      Object.keys(context).length > 0 ? context : '',
      data ?? ''
    );
  }

  // Log methods (Pino API)
  trace(msgOrObj: string | object, ...args: unknown[]): void {
    this.write('trace', msgOrObj, ...args);
  }

  debug(msgOrObj: string | object, ...args: unknown[]): void {
    this.write('debug', msgOrObj, ...args);
  }

  info(msgOrObj: string | object, ...args: unknown[]): void {
    this.write('info', msgOrObj, ...args);
  }

  warn(msgOrObj: string | object, ...args: unknown[]): void {
    this.write('warn', msgOrObj, ...args);
  }

  error(msgOrObj: string | object | Error, ...args: unknown[]): void {
    if (msgOrObj instanceof Error) {
      this.write('error', { err: { message: msgOrObj.message, stack: msgOrObj.stack } }, ...args);
    } else {
      this.write('error', msgOrObj, ...args);
    }
  }

  fatal(msgOrObj: string | object | Error, ...args: unknown[]): void {
    if (msgOrObj instanceof Error) {
      this.write('fatal', { err: { message: msgOrObj.message, stack: msgOrObj.stack } }, ...args);
    } else {
      this.write('fatal', msgOrObj, ...args);
    }
  }

  // Timing utilities
  time(label: string): void {
    if (this.enabled) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.enabled) {
      console.timeEnd(label);
    }
  }
}

/**
 * Create logger instance (Pino-style API)
 * @param options - Logger configuration
 * @returns Logger instance
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const logger = createLogger();
 * logger.info('hello world');
 * 
 * // With context
 * const logger = createLogger({ base: { service: 'api' } });
 * 
 * // Child logger
 * const requestLogger = logger.child({ requestId: 'req-123' });
 * requestLogger.info('processing request');
 * 
 * // Multiple styles (Pino-compatible)
 * logger.info({ userId: 123 }, 'user logged in');
 * logger.error(new Error('Failed'), 'operation failed');
 * ```
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}

// Default logger instance
export const logger = createLogger();


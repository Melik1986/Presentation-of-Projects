/* eslint-disable no-console */
/**
 * Simple structured logger
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LoggerOptions {
  level?: LogLevel;
  enabled?: boolean;
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

class Logger {
  private minLevel: number;
  private enabled: boolean;
  private context: string;

  constructor(options: LoggerOptions = {}, context = '') {
    this.minLevel = LEVELS[options.level ?? 'info'];
    this.enabled = options.enabled ?? process.env.NODE_ENV !== 'production';
    this.context = context;
  }

  child(bindings: ChildBindings): Logger {
    const contextParts = this.context ? [this.context] : [];
    Object.entries(bindings).forEach(([key, value]) => {
      contextParts.push(`${key}=${value}`);
    });
    return new Logger({ level: this.levelName, enabled: this.enabled }, contextParts.join(' '));
  }

  bindings(): ChildBindings {
    return { context: this.context };
  }

  setBindings(bindings: ChildBindings): void {
    const parts = this.context ? [this.context] : [];
    Object.entries(bindings).forEach(([key, value]) => {
      parts.push(`${key}=${value}`);
    });
    this.context = parts.join(' ');
  }

  private get levelName(): LogLevel {
    const entry = Object.entries(LEVELS).find(([, value]) => value === this.minLevel);
    return (entry?.[0] as LogLevel) ?? 'info';
  }

  private shouldLog(level: number): boolean {
    return this.enabled && level >= this.minLevel;
  }

  private log(level: LogLevel, ...parts: unknown[]): void {
    if (!this.shouldLog(LEVELS[level])) return;

    const consoleMethod =
      level === 'fatal' || level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    const emoji = { trace: '🔍', debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌', fatal: '💀' }[
      level
    ];
    const timeStr = new Date().toISOString().split('T')[1]?.slice(0, -1);

    const prefix = `${emoji} [${timeStr}]${this.context ? ` [${this.context}]` : ''}`;

    console[consoleMethod](prefix, ...parts);
  }

  trace(...args: unknown[]): void {
    this.log('trace', ...args);
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  fatal(...args: unknown[]): void {
    this.log('fatal', ...args);
  }

  time(label: string): void {
    if (this.enabled) {
      console.time(`${this.context ? `[${this.context}] ` : ''}${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.enabled) {
      console.timeEnd(`${this.context ? `[${this.context}] ` : ''}${label}`);
    }
  }
}

/**
 * Create logger instance
 * @param options - Logger configuration
 *
 * @example
 * ```typescript
 * const logger = createLogger();
 * logger.info('hello world');
 *
 * const audioLogger = logger.child({ module: 'AudioDirector' });
 * audioLogger.error(error, 'Failed to load', { trackId: '123' });
 * ```
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}

export const logger = createLogger();

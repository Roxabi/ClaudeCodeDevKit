/**
 * Frontend Logger Utility
 *
 * This utility provides structured logging functionality for the frontend application.
 * It supports different log levels and can be configured for different environments.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

export class Logger {
  private component: string;
  private static globalLevel: LogLevel = LogLevel.INFO;
  private static logs: LogEntry[] = [];
  private static maxLogs: number = 1000;

  constructor(component: string) {
    this.component = component;
  }

  /**
   * Set global log level
   */
  static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  /**
   * Get global log level
   */
  static getLevel(): LogLevel {
    return Logger.globalLevel;
  }

  /**
   * Set maximum number of stored logs
   */
  static setMaxLogs(max: number): void {
    Logger.maxLogs = max;
    // Trim existing logs if necessary
    if (Logger.logs.length > max) {
      Logger.logs = Logger.logs.slice(-max);
    }
  }

  /**
   * Get all stored logs
   */
  static getLogs(): LogEntry[] {
    return [...Logger.logs];
  }

  /**
   * Clear all stored logs
   */
  static clearLogs(): void {
    Logger.logs = [];
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < Logger.globalLevel) {
      return; // Skip logging if below global level
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      data,
    };

    // Store the log entry
    Logger.logs.push(entry);

    // Trim logs if we exceed the maximum
    if (Logger.logs.length > Logger.maxLogs) {
      Logger.logs.shift();
    }

    // Output to console
    this.outputToConsole(entry);
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.component}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} 🐛`, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ℹ️`, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ⚠️`, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ❌`, entry.message, entry.data || '');
        break;
    }
  }

  /**
   * Create a child logger with a sub-component name
   */
  child(subComponent: string): Logger {
    return new Logger(`${this.component}.${subComponent}`);
  }

  /**
   * Log execution time of a function
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T>;
  time<T>(label: string, fn: () => T): T;
  time<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
    const start = performance.now();
    this.debug(`Starting: ${label}`);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.then(
          value => {
            const end = performance.now();
            this.debug(`Completed: ${label} (${(end - start).toFixed(2)}ms)`);
            return value;
          },
          error => {
            const end = performance.now();
            this.error(
              `Failed: ${label} (${(end - start).toFixed(2)}ms)`,
              error
            );
            throw error;
          }
        );
      } else {
        const end = performance.now();
        this.debug(`Completed: ${label} (${(end - start).toFixed(2)}ms)`);
        return result;
      }
    } catch (error) {
      const end = performance.now();
      this.error(`Failed: ${label} (${(end - start).toFixed(2)}ms)`, error);
      throw error;
    }
  }

  /**
   * Log object properties
   */
  inspect(obj: any, label?: string): void {
    const message = label ? `${label}:` : 'Object inspection:';
    this.debug(message, obj);
  }

  /**
   * Create a logger group for related logs
   */
  group(label: string): LoggerGroup {
    return new LoggerGroup(this, label);
  }
}

/**
 * Logger group for organizing related logs
 */
export class LoggerGroup {
  private logger: Logger;
  private label: string;
  private isCollapsed: boolean = false;

  constructor(logger: Logger, label: string) {
    this.logger = logger;
    this.label = label;
    console.group(label);
  }

  /**
   * Log within the group
   */
  log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    this.logger[level](message, data);
  }

  /**
   * Collapse the group
   */
  collapse(): void {
    if (!this.isCollapsed) {
      console.groupCollapsed(this.label);
      this.isCollapsed = true;
    }
  }

  /**
   * End the group
   */
  end(): void {
    console.groupEnd();
  }
}

/**
 * Initialize logger based on environment
 */
export function initializeLogger(): void {
  // Set log level based on environment
  const isDevelopment =
    (typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development') ||
    window.location.hostname === 'localhost';

  if (isDevelopment) {
    Logger.setLevel(LogLevel.DEBUG);
  } else {
    Logger.setLevel(LogLevel.WARN);
  }

  // Add global error handling
  window.addEventListener('error', event => {
    const logger = new Logger('Global');
    logger.error('Uncaught error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener('unhandledrejection', event => {
    const logger = new Logger('Global');
    logger.error('Unhandled promise rejection:', event.reason);
  });
}

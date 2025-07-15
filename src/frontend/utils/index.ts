/**
 * Frontend Utilities Index
 *
 * This file exports all the main frontend utilities for easy importing.
 */

// Logger utility
export { Logger, LogLevel, LoggerGroup, initializeLogger } from './logger';
export type { LogEntry } from './logger';

// Re-export for convenience
export default {
  Logger,
  LogLevel,
  LoggerGroup,
  initializeLogger,
};

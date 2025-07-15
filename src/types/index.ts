/**
 * Shared Types - Main Export File
 *
 * This file exports all shared types that can be used by both frontend and backend
 */

// Common data types
export * from './common';
export * from './api';
export * from './user';

// Re-export utility types
export type { DeepPartial, Optional, NonNullable } from './utils';

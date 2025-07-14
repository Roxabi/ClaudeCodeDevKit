/**
 * Central type definitions for the application
 */

// Application configuration interface
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  debug: boolean;
}

// Example user interface
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Example database connection options
export interface DatabaseConfig {
  connectionString: string;
  maxConnections?: number;
  idleTimeout?: number;
  ssl?: boolean;
}

// Example Redis configuration
export interface RedisConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
}

// Example error types
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Type guards
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value
  );
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<ApiResponse<T>>;

// Constants
export const API_VERSION = '1.0.0' as const;
export const DEFAULT_PAGE_SIZE = 20 as const;

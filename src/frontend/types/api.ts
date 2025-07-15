/**
 * API-specific Type Definitions
 *
 * This file contains TypeScript interfaces and types
 * specifically related to API communication.
 */

import type { HttpMethod } from './index';

// ============================================================================
// API Client Types
// ============================================================================

export interface ApiClient {
  get<T>(url: string, config?: RequestOptions): Promise<T>;
  post<T>(url: string, data?: any, config?: RequestOptions): Promise<T>;
  put<T>(url: string, data?: any, config?: RequestOptions): Promise<T>;
  patch<T>(url: string, data?: any, config?: RequestOptions): Promise<T>;
  delete<T>(url: string, config?: RequestOptions): Promise<T>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ============================================================================
// User API Types
// ============================================================================

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
  preferences?: any;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface FileUploadRequest {
  file: File;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  signature: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitExceededError extends ApiError {
  rateLimitInfo: RateLimitInfo;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// ============================================================================
// Middleware Types
// ============================================================================

export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

export interface ResponseInterceptor {
  (response: ApiResponse): ApiResponse | Promise<ApiResponse>;
}

export interface ErrorInterceptor {
  (error: ApiError): ApiError | Promise<ApiError>;
}

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationRequest {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> extends PaginationResponse<T> {
  query: string;
  took: number;
  suggestions?: string[];
}

// ============================================================================
// Batch Operation Types
// ============================================================================

export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
}

export interface BatchOperation<T> {
  method: HttpMethod;
  url: string;
  data?: T;
  id?: string;
}

export interface BatchResponse<T> {
  results: BatchResult<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface BatchResult<T> {
  id?: string;
  status: number;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// Real-time Types
// ============================================================================

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  id?: string;
  timestamp: number;
}

export interface SubscriptionRequest {
  channel: string;
  filters?: Record<string, any>;
}

export interface SubscriptionResponse {
  channel: string;
  subscriptionId: string;
  status: 'subscribed' | 'unsubscribed' | 'error';
  error?: string;
}

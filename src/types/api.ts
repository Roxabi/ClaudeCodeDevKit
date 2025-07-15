/**
 * API Types - Request and response types for API communication
 */

import type { BaseResponse, PaginationParams, ValidationError } from './common';

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Request types
export interface ApiRequest<T = unknown> {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: T;
}

export interface ApiResponse<T = unknown> extends BaseResponse {
  data?: T;
  errors?: ValidationError[];
}

// Authentication types
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
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Generic list request
export interface ListRequest extends PaginationParams {
  search?: string;
  filters?: Record<string, unknown>;
}

// File upload types
export interface FileUploadRequest {
  file: File | Buffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  url: string;
  size: number;
  uploadedAt: string;
}

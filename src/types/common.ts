/**
 * Common Types - Shared across frontend and backend
 */

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// Response types
export interface BaseResponse {
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;
    details?: string;
  };
}

export interface SuccessResponse<T = unknown> extends BaseResponse {
  success: true;
  data: T;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Common entity fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Frontend Type Definitions
 *
 * This file contains shared TypeScript interfaces, types, and enums
 * used throughout the frontend application.
 */

// ============================================================================
// Common Types
// ============================================================================

export type ID = string | number;

export interface Timestamp {
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analytics: boolean;
}

// ============================================================================
// UI Types
// ============================================================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

export interface Modal {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'confirm';
  actions?: ModalAction[];
  dismissible?: boolean;
}

export interface ModalAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormField<T = any> {
  name: string;
  label: string;
  type: FieldType;
  value: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  DATE = 'date',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FormErrors {
  [fieldName: string]: string[];
}

// ============================================================================
// Event Types
// ============================================================================

export interface CustomEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}

export interface ComponentEvent extends CustomEvent {
  component: string;
  action: string;
}

export interface NavigationEvent extends CustomEvent {
  from: string;
  to: string;
}

export interface ErrorEvent extends CustomEvent {
  error: Error;
  context?: any;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  headers: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type EventHandler<T = any> = (event: T) => void;

export type AsyncFunction<T = any, R = any> = (args: T) => Promise<R>;

export type Constructor<T = {}> = new (...args: any[]) => T;

// ============================================================================
// Environment Types
// ============================================================================

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  API_TIMEOUT: number;
  LOG_LEVEL: string;
  ENABLE_ANALYTICS: boolean;
  VERSION: string;
}

// ============================================================================
// Route Types
// ============================================================================

export interface RouteDefinition {
  path: string;
  component: string;
  title?: string;
  meta?: RouteMeta;
  children?: RouteDefinition[];
}

export interface RouteMeta {
  requiresAuth?: boolean;
  roles?: UserRole[];
  layout?: string;
  breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
  label: string;
  path?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  onClick?: EventHandler<MouseEvent>;
}

export interface InputProps extends BaseComponentProps {
  type?: FieldType;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  onChange?: EventHandler<InputEvent>;
  onBlur?: EventHandler<FocusEvent>;
  onFocus?: EventHandler<FocusEvent>;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  length: number;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
}

// ============================================================================
// Export all types
// ============================================================================

export * from './api';
export * from './components';
export * from './events';

// Default export for convenience
export default {
  // Re-export commonly used types
  User,
  UserRole,
  Theme,
  Modal,
  Toast,
  FormField,
  FieldType,
  ValidationRule,
  ApiResponse,
  HttpMethod,
  Environment,
};

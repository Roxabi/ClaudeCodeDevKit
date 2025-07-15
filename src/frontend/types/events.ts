/**
 * Event-specific Type Definitions
 *
 * This file contains TypeScript interfaces and types
 * specifically related to event handling and management.
 */

// ============================================================================
// Base Event Types
// ============================================================================

export interface BaseEvent {
  type: string;
  timestamp: number;
  source: string;
  id?: string;
}

export interface CustomEvent<T = any> extends BaseEvent {
  data: T;
  bubbles?: boolean;
  cancelable?: boolean;
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// ============================================================================
// DOM Event Types
// ============================================================================

export interface MouseEventData {
  clientX: number;
  clientY: number;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface KeyboardEventData {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
}

export interface TouchEventData {
  touches: TouchPoint[];
  changedTouches: TouchPoint[];
  targetTouches: TouchPoint[];
}

export interface TouchPoint {
  identifier: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;
}

export interface FocusEventData {
  relatedTarget?: EventTarget;
}

export interface InputEventData {
  value: string | number;
  inputType: string;
  isComposing: boolean;
}

// ============================================================================
// Application Event Types
// ============================================================================

export interface AppEvent extends BaseEvent {
  category: EventCategory;
  action: string;
  context?: Record<string, any>;
}

export enum EventCategory {
  USER = 'user',
  SYSTEM = 'system',
  NAVIGATION = 'navigation',
  API = 'api',
  UI = 'ui',
  ERROR = 'error',
  ANALYTICS = 'analytics',
}

// ============================================================================
// Navigation Events
// ============================================================================

export interface NavigationEvent extends AppEvent {
  category: EventCategory.NAVIGATION;
  from: string;
  to: string;
  params?: Record<string, any>;
  meta?: RouteMeta;
}

export interface RouteChangeEvent extends NavigationEvent {
  action: 'ROUTE_CHANGE';
}

export interface RouteErrorEvent extends NavigationEvent {
  action: 'ROUTE_ERROR';
  error: Error;
}

export interface RouteMeta {
  requiresAuth?: boolean;
  title?: string;
  breadcrumbs?: string[];
}

// ============================================================================
// User Events
// ============================================================================

export interface UserEvent extends AppEvent {
  category: EventCategory.USER;
  userId?: string;
  sessionId?: string;
}

export interface LoginEvent extends UserEvent {
  action: 'LOGIN';
  method: 'email' | 'oauth' | 'sso';
}

export interface LogoutEvent extends UserEvent {
  action: 'LOGOUT';
  reason: 'user' | 'timeout' | 'force';
}

export interface UserActionEvent extends UserEvent {
  action: 'CLICK' | 'SCROLL' | 'HOVER' | 'FOCUS' | 'BLUR';
  element: string;
  position?: { x: number; y: number };
}

// ============================================================================
// System Events
// ============================================================================

export interface SystemEvent extends AppEvent {
  category: EventCategory.SYSTEM;
  level: 'info' | 'warning' | 'error' | 'critical';
}

export interface AppStartEvent extends SystemEvent {
  action: 'APP_START';
  version: string;
  environment: string;
}

export interface AppStopEvent extends SystemEvent {
  action: 'APP_STOP';
  reason: string;
}

export interface PerformanceEvent extends SystemEvent {
  action: 'PERFORMANCE';
  metric: string;
  value: number;
  unit: string;
}

export interface ErrorEvent extends SystemEvent {
  action: 'ERROR';
  error: ErrorDetails;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  component?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
}

// ============================================================================
// API Events
// ============================================================================

export interface ApiEvent extends AppEvent {
  category: EventCategory.API;
  endpoint: string;
  method: string;
  status?: number;
  duration?: number;
}

export interface ApiRequestEvent extends ApiEvent {
  action: 'REQUEST';
  requestId: string;
  payload?: any;
}

export interface ApiResponseEvent extends ApiEvent {
  action: 'RESPONSE';
  requestId: string;
  success: boolean;
  data?: any;
  error?: any;
}

export interface ApiErrorEvent extends ApiEvent {
  action: 'ERROR';
  requestId: string;
  error: ApiErrorDetails;
}

export interface ApiErrorDetails {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// UI Events
// ============================================================================

export interface UiEvent extends AppEvent {
  category: EventCategory.UI;
  component: string;
  componentId?: string;
}

export interface ComponentMountEvent extends UiEvent {
  action: 'MOUNT';
  props?: Record<string, any>;
}

export interface ComponentUnmountEvent extends UiEvent {
  action: 'UNMOUNT';
}

export interface ComponentUpdateEvent extends UiEvent {
  action: 'UPDATE';
  prevProps?: Record<string, any>;
  nextProps?: Record<string, any>;
}

export interface ComponentErrorEvent extends UiEvent {
  action: 'ERROR';
  error: Error;
  errorInfo?: any;
}

export interface ModalEvent extends UiEvent {
  action: 'OPEN' | 'CLOSE';
  modalId: string;
  reason?: string;
}

export interface ToastEvent extends UiEvent {
  action: 'SHOW' | 'HIDE';
  toastId: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

// ============================================================================
// Form Events
// ============================================================================

export interface FormEvent extends UiEvent {
  formId: string;
  fieldName?: string;
}

export interface FormSubmitEvent extends FormEvent {
  action: 'SUBMIT';
  data: Record<string, any>;
  isValid: boolean;
}

export interface FormValidationEvent extends FormEvent {
  action: 'VALIDATION';
  errors: Record<string, string[]>;
}

export interface FieldChangeEvent extends FormEvent {
  action: 'FIELD_CHANGE';
  value: any;
  previousValue?: any;
}

export interface FieldFocusEvent extends FormEvent {
  action: 'FIELD_FOCUS' | 'FIELD_BLUR';
}

// ============================================================================
// Analytics Events
// ============================================================================

export interface AnalyticsEvent extends AppEvent {
  category: EventCategory.ANALYTICS;
  event: string;
  properties?: Record<string, any>;
}

export interface PageViewEvent extends AnalyticsEvent {
  action: 'PAGE_VIEW';
  page: string;
  title?: string;
  referrer?: string;
}

export interface TrackEvent extends AnalyticsEvent {
  action: 'TRACK';
  event: string;
  value?: number;
  currency?: string;
}

export interface ConversionEvent extends AnalyticsEvent {
  action: 'CONVERSION';
  goal: string;
  value?: number;
  revenue?: number;
}

// ============================================================================
// Event Bus Types
// ============================================================================

export interface EventBus {
  on<T = any>(event: string, handler: EventHandler<T>): () => void;
  once<T = any>(event: string, handler: EventHandler<T>): () => void;
  emit<T = any>(event: string, data: T): void;
  off(event: string, handler?: EventHandler): void;
  clear(): void;
  listenerCount(event?: string): number;
}

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  once: boolean;
  id: string;
}

export interface EventEmitter {
  addEventListener<T = any>(event: string, handler: EventHandler<T>): void;
  removeEventListener(event: string, handler: EventHandler): void;
  dispatchEvent<T = any>(event: string, data: T): void;
}

// ============================================================================
// Event Middleware Types
// ============================================================================

export interface EventMiddleware<T = any> {
  (event: T, next: () => void): void;
}

export interface EventInterceptor<T = any> {
  before?: (event: T) => T | Promise<T>;
  after?: (event: T) => void | Promise<void>;
  error?: (error: Error, event: T) => void | Promise<void>;
}

export interface EventFilter<T = any> {
  (event: T): boolean;
}

export interface EventTransformer<T = any, R = any> {
  (event: T): R;
}

// ============================================================================
// Event Configuration
// ============================================================================

export interface EventConfig {
  maxListeners?: number;
  warningThreshold?: number;
  asyncHandlers?: boolean;
  errorHandling?: 'throw' | 'log' | 'ignore';
  middleware?: EventMiddleware[];
  interceptors?: EventInterceptor[];
}

export interface EventMetrics {
  eventCounts: Record<string, number>;
  listenerCounts: Record<string, number>;
  errorCounts: Record<string, number>;
  averageProcessingTime: Record<string, number>;
}

// ============================================================================
// WebSocket Events
// ============================================================================

export interface WebSocketEvent extends BaseEvent {
  connectionId: string;
  channel?: string;
}

export interface WebSocketConnectEvent extends WebSocketEvent {
  action: 'CONNECT';
}

export interface WebSocketDisconnectEvent extends WebSocketEvent {
  action: 'DISCONNECT';
  reason: string;
  code: number;
}

export interface WebSocketMessageEvent<T = any> extends WebSocketEvent {
  action: 'MESSAGE';
  data: T;
}

export interface WebSocketErrorEvent extends WebSocketEvent {
  action: 'ERROR';
  error: Error;
}

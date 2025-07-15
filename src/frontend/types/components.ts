/**
 * Component-specific Type Definitions
 *
 * This file contains TypeScript interfaces and types
 * specifically related to UI components.
 */

// ============================================================================
// Base Component Types
// ============================================================================

export interface BaseProps {
  id?: string;
  className?: string;
  testId?: string;
  children?: any;
}

export interface ComponentState {
  [key: string]: any;
}

export interface ComponentLifecycle {
  beforeMount?(): void;
  afterMount?(): void;
  beforeUpdate?(prevProps: any): void;
  afterUpdate?(prevProps: any): void;
  beforeDestroy?(): void;
}

// ============================================================================
// Layout Components
// ============================================================================

export interface LayoutProps extends BaseProps {
  header?: boolean;
  footer?: boolean;
  sidebar?: boolean;
  maxWidth?: string;
  padding?: string;
}

export interface HeaderProps extends BaseProps {
  title?: string;
  logo?: string;
  navigation?: NavigationItem[];
  user?: UserHeaderInfo;
  actions?: HeaderAction[];
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
  children?: NavigationItem[];
}

export interface UserHeaderInfo {
  name: string;
  avatar?: string;
  role?: string;
}

export interface HeaderAction {
  label: string;
  icon?: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface SidebarProps extends BaseProps {
  collapsed?: boolean;
  position?: 'left' | 'right';
  width?: string;
  navigation?: NavigationItem[];
  onToggle?: (collapsed: boolean) => void;
}

export interface FooterProps extends BaseProps {
  links?: FooterLink[];
  copyright?: string;
  social?: SocialLink[];
}

export interface FooterLink {
  label: string;
  path: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// ============================================================================
// Form Components
// ============================================================================

export interface FormProps extends BaseProps {
  onSubmit: (data: any) => void;
  validation?: ValidationConfig;
  loading?: boolean;
  disabled?: boolean;
}

export interface ValidationConfig {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export enum ValidationType {
  REQUIRED = 'required',
  EMAIL = 'email',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  PATTERN = 'pattern',
  CUSTOM = 'custom',
}

export interface InputProps extends BaseProps {
  type?: InputType;
  name: string;
  value?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoComplete?: string;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export enum InputType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEL = 'tel',
  URL = 'url',
  SEARCH = 'search',
}

export interface SelectProps extends BaseProps {
  name: string;
  value?: string | number | string[];
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  onChange?: (value: string | number | string[]) => void;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface CheckboxProps extends BaseProps {
  name: string;
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface RadioProps extends BaseProps {
  name: string;
  value: string | number;
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
}

export interface TextareaProps extends BaseProps {
  name: string;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  onChange?: (value: string) => void;
}

// ============================================================================
// Button Components
// ============================================================================

export interface ButtonProps extends BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  GHOST = 'ghost',
  DANGER = 'danger',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export enum ButtonSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

// ============================================================================
// Data Display Components
// ============================================================================

export interface TableProps<T = any> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  selection?: SelectionConfig<T>;
  actions?: TableAction<T>[];
  onRowClick?: (row: T, index: number) => void;
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => string | any;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  onChange?: (page: number, limit: number) => void;
}

export interface SortingConfig {
  field?: string;
  order?: 'asc' | 'desc';
  onChange?: (field: string, order: 'asc' | 'desc') => void;
}

export interface SelectionConfig<T = any> {
  selectedRows: T[];
  onSelectionChange: (rows: T[]) => void;
  type?: 'checkbox' | 'radio';
}

export interface TableAction<T = any> {
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  condition?: (row: T) => boolean;
  action: (row: T, index: number) => void;
}

export interface ListProps<T = any> extends BaseProps {
  data: T[];
  renderItem: (item: T, index: number) => string | any;
  loading?: boolean;
  emptyMessage?: string;
  itemKey?: keyof T | ((item: T) => string);
}

export interface CardProps extends BaseProps {
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: CardAction[];
  hoverable?: boolean;
  bordered?: boolean;
}

export interface CardAction {
  label: string;
  action: () => void;
  variant?: ButtonVariant;
}

// ============================================================================
// Feedback Components
// ============================================================================

export interface ModalProps extends BaseProps {
  visible: boolean;
  title?: string;
  width?: string;
  height?: string;
  closable?: boolean;
  maskClosable?: boolean;
  footer?: ModalFooter;
  onClose: () => void;
}

export interface ModalFooter {
  actions: ModalAction[];
}

export interface ModalAction {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  action: () => void;
}

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  closable?: boolean;
  action?: ToastAction;
}

export enum ToastType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

export interface ToastAction {
  label: string;
  action: () => void;
}

export interface LoadingProps extends BaseProps {
  size?: 'small' | 'default' | 'large';
  text?: string;
  overlay?: boolean;
}

export interface ProgressProps extends BaseProps {
  value: number;
  max?: number;
  showText?: boolean;
  format?: (value: number, max: number) => string;
  type?: 'line' | 'circle';
  status?: 'normal' | 'success' | 'error';
}

// ============================================================================
// Navigation Components
// ============================================================================

export interface TabsProps extends BaseProps {
  activeTab: string;
  tabs: TabItem[];
  onChange: (tabKey: string) => void;
  type?: 'line' | 'card';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  closable?: boolean;
}

export interface BreadcrumbProps extends BaseProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface PaginationProps extends BaseProps {
  current: number;
  total: number;
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  onChange: (page: number, pageSize: number) => void;
}

// ============================================================================
// Utility Components
// ============================================================================

export interface TooltipProps extends BaseProps {
  content: string;
  placement?: TooltipPlacement;
  trigger?: 'hover' | 'click' | 'focus';
  visible?: boolean;
}

export enum TooltipPlacement {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface PopoverProps extends BaseProps {
  content: string | any;
  title?: string;
  placement?: TooltipPlacement;
  trigger?: 'hover' | 'click' | 'focus';
  visible?: boolean;
}

export interface DrawerProps extends BaseProps {
  visible: boolean;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  height?: string;
  closable?: boolean;
  maskClosable?: boolean;
  onClose: () => void;
}

export interface CollapseProps extends BaseProps {
  items: CollapseItem[];
  activeKeys?: string[];
  accordion?: boolean;
  onChange?: (activeKeys: string[]) => void;
}

export interface CollapseItem {
  key: string;
  title: string;
  content: string | any;
  disabled?: boolean;
}

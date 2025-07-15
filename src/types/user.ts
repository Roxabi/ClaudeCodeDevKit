/**
 * User Types - User-related interfaces and types
 */

import type { BaseEntity, Status } from './common';

// User roles
export type UserRole = 'admin' | 'user' | 'moderator';

// User interface
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  status: Status;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  profile?: UserProfile;
}

// User profile
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences: UserPreferences;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

// Notification settings
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

// User creation and update types
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  status?: Status;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences?: Partial<UserPreferences>;
}

// User query types
export interface UserListQuery {
  role?: UserRole;
  status?: Status;
  search?: string;
  emailVerified?: boolean;
}

// Public user info (without sensitive data)
export interface PublicUser {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
}

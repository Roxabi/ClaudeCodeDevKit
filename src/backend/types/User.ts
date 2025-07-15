export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface FindUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
}

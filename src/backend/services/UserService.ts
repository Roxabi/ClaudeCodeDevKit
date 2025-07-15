import type {
  User,
  CreateUserData,
  UpdateUserData,
  FindUsersOptions,
} from '../types/User';

export class UserService {
  // In a real implementation, this would interact with a database
  private users: User[] = [];

  async findAll(
    options: FindUsersOptions = {}
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search } = options;
    let filteredUsers = this.users;

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = this.users.filter(
        user =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total: filteredUsers.length,
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updates: UpdateUserData): Promise<User> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users.splice(userIndex, 1);
  }

  private generateId(): string {
    // Simple UUID v4 generator for demo purposes
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

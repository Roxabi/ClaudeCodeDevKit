import type { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.userService.findAll({
        page,
        limit,
        search,
      });

      res.json({
        users: result.users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        })),
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if user exists
      const existingUser = await this.userService.findById(id);
      if (!existingUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Update user
      const updatedUser = await this.userService.update(id, updates);

      logger.info(`User updated: ${updatedUser.email}`);

      res.json({
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        },
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await this.userService.findById(id);
      if (!existingUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await this.userService.delete(id);

      logger.info(`User deleted: ${existingUser.email}`);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

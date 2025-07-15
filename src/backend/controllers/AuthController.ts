import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/environment';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      logger.info(`User logged in: ${user.email}`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await this.userService.create({
        email,
        passwordHash,
        firstName,
        lastName,
      });

      logger.info(`New user registered: ${newUser.email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: 'Logout successful' });
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Token required' });
        return;
      }

      // Verify and decode the token
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;

      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token: newToken });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const user = await this.userService.findById(userId);

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
        },
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

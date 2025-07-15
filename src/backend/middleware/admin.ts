import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userService = new UserService();
    const user = await userService.findById(req.user.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // In a real implementation, you would check user roles/permissions
    // For this demo, we'll use a simple email-based check
    const adminEmails = ['admin@example.com', 'superuser@example.com'];

    if (!adminEmails.includes(user.email)) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

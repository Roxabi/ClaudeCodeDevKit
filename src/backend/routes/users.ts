import { Router } from 'express';
import { param, body, query } from 'express-validator';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();
const userController = new UserController();

// Validation middleware
const userIdValidation = [
  param('id').isUUID().withMessage('Invalid user ID format'),
];

const updateUserValidation = [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().escape(),
];

// User routes (all require authentication)
router.use(authMiddleware);

// Get all users (admin only)
router.get('/', adminMiddleware, queryValidation, userController.getUsers);

// Get user by ID
router.get('/:id', userIdValidation, userController.getUserById);

// Update user profile
router.put(
  '/:id',
  userIdValidation,
  updateUserValidation,
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  '/:id',
  adminMiddleware,
  userIdValidation,
  userController.deleteUser
);

export { router as userRoutes };

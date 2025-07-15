import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Validation middleware for login
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

// Validation middleware for registration
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
];

// Validation error handler
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Auth routes
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  authController.login
);
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  authController.register
);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', authMiddleware, authController.getCurrentUser);

export { router as authRoutes };

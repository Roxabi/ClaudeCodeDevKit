// Main backend entry point
export { app, server } from './server';

// Configuration
export { config } from './config/environment';

// Controllers
export { AuthController } from './controllers/AuthController';
export { UserController } from './controllers/UserController';

// Services
export { UserService } from './services/UserService';

// Middleware
export { authMiddleware } from './middleware/auth';
export { adminMiddleware } from './middleware/admin';
export { errorHandler } from './middleware/errorHandler';

// Types
export * from './types/User';

// Utilities
export { logger } from './utils/logger';
export { database } from './utils/database';

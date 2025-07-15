import { Router } from 'express';
import { authRoutes } from './auth';
import { userRoutes } from './users';
import { config } from '../config/environment';

const router = Router();

// API version prefix
const apiVersion = `/v${config.API_VERSION}`;

// Route modules
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/users`, userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Development Template API',
    version: config.API_VERSION,
    environment: config.NODE_ENV,
    endpoints: {
      auth: `${apiVersion}/auth`,
      users: `${apiVersion}/users`,
      health: '/health',
    },
  });
});

export { router as apiRoutes };

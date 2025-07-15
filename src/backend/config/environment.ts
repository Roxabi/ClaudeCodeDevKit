import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  API_VERSION: string;
}

const requiredEnvVars = ['NODE_ENV', 'DATABASE_URL', 'JWT_SECRET'] as const;

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Validate environment variables in production
if (process.env.NODE_ENV === 'production') {
  validateEnvironment();
}

export const config: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/devdb',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_VERSION: process.env.API_VERSION || 'v1',
};

export default config;

#!/usr/bin/env tsx

/**
 * Main application entry point
 * This is an example TypeScript file demonstrating the development environment setup
 */

import { config } from 'dotenv';
import type { AppConfig } from './types';

// Load environment variables
config();

// Example type-safe configuration
const appConfig: AppConfig = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: (process.env['NODE_ENV'] ?? 'development') as
    | 'development'
    | 'production'
    | 'test',
  debug: process.env['DEBUG_MODE'] === 'true',
};

// Example async function with proper error handling
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting application...');
    console.log(`Environment: ${appConfig.nodeEnv}`);
    console.log(`Port: ${appConfig.port}`);
    console.log(`Debug mode: ${appConfig.debug ? 'enabled' : 'disabled'}`);

    // Example async operation
    await Promise.resolve();

    // Example of using services
    if (process.env['DATABASE_URL']) {
      console.log('✅ Database URL configured');
    }

    if (process.env['REDIS_URL']) {
      console.log('✅ Redis URL configured');
    }

    // Your application logic here
    console.log('🎉 Application started successfully!');
  } catch (error) {
    console.error('❌ Application failed to start:', error);
    process.exit(1);
  }
}

// Run the application
void main();

/**
 * Frontend Application Entry Point
 *
 * This is the main entry point for the frontend application.
 * It demonstrates basic TypeScript setup and application initialization.
 */

import { App } from './components/App';
import { Logger } from './utils/logger';

// Initialize logger
const logger = new Logger('Frontend');

/**
 * Initialize the application
 */
async function initializeApp(): Promise<void> {
  try {
    logger.info('Initializing frontend application...');

    // Create app instance
    const app = new App();

    // Start the application
    await app.start();

    logger.info('Frontend application started successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

// Start the application when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
} else {
  // Node.js environment - for testing or SSR
  initializeApp();
}

export { App, Logger };

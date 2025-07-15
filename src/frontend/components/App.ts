/**
 * Main Application Component
 *
 * This is the root component of the frontend application.
 * It manages the overall application state and routing.
 */

import { Component } from './Component';
import { Router } from './Router';
import { StateManager } from '../state/StateManager';
import { Logger } from '../utils/logger';

export interface AppConfig {
  containerId: string;
  enableRouting: boolean;
  enableStateManagement: boolean;
}

export class App extends Component {
  private router: Router;
  private stateManager: StateManager;
  private logger: Logger;
  private config: AppConfig;

  constructor(config: Partial<AppConfig> = {}) {
    super();

    this.config = {
      containerId: 'app',
      enableRouting: true,
      enableStateManagement: true,
      ...config,
    };

    this.logger = new Logger('App');
    this.router = new Router();
    this.stateManager = new StateManager();
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    try {
      this.logger.info('Starting application...');

      // Initialize state management
      if (this.config.enableStateManagement) {
        await this.initializeStateManager();
      }

      // Initialize routing
      if (this.config.enableRouting) {
        await this.initializeRouter();
      }

      // Render the application
      this.render();

      this.logger.info('Application started successfully');
    } catch (error) {
      this.logger.error('Failed to start application:', error);
      throw error;
    }
  }

  /**
   * Initialize the state manager
   */
  private async initializeStateManager(): Promise<void> {
    this.logger.debug('Initializing state manager...');
    await this.stateManager.initialize();
  }

  /**
   * Initialize the router
   */
  private async initializeRouter(): Promise<void> {
    this.logger.debug('Initializing router...');
    await this.router.initialize();
  }

  /**
   * Render the application
   */
  render(): void {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      throw new Error(
        `Container with id "${this.config.containerId}" not found`
      );
    }

    container.innerHTML = this.getTemplate();
    this.attachEventListeners();
  }

  /**
   * Get the application template
   */
  protected getTemplate(): string {
    return `
      <div class="app">
        <header class="app-header">
          <h1>Frontend Application</h1>
          <nav id="navigation"></nav>
        </header>
        <main class="app-main" id="main-content">
          <div class="loading">Loading...</div>
        </main>
        <footer class="app-footer">
          <p>&copy; 2024 Frontend Application</p>
        </footer>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Add global event listeners here
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener(
      'unhandledrejection',
      this.handleUnhandledRejection.bind(this)
    );
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.logger.error('Global error:', event.error);
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.logger.error('Unhandled promise rejection:', event.reason);
  }
}

/**
 * Frontend Router Component
 *
 * This component handles client-side routing for the frontend application.
 * It manages navigation between different views and maintains browser history.
 */

import { Logger } from '../utils/logger';

export interface Route {
  path: string;
  component: string;
  title?: string;
  requiresAuth?: boolean;
}

export interface RouteParams {
  [key: string]: string;
}

export class Router {
  private routes: Route[] = [];
  private currentRoute?: Route;
  private currentParams: RouteParams = {};
  private logger: Logger;

  constructor() {
    this.logger = new Logger('Router');
  }

  /**
   * Initialize the router
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing router...');

    // Set up default routes
    this.setupDefaultRoutes();

    // Set up event listeners
    this.setupEventListeners();

    // Handle initial route
    await this.handleRoute(window.location.pathname);

    this.logger.info('Router initialized successfully');
  }

  /**
   * Set up default routes
   */
  private setupDefaultRoutes(): void {
    this.addRoute({
      path: '/',
      component: 'HomePage',
      title: 'Home',
    });

    this.addRoute({
      path: '/about',
      component: 'AboutPage',
      title: 'About',
    });

    this.addRoute({
      path: '/contact',
      component: 'ContactPage',
      title: 'Contact',
    });

    this.addRoute({
      path: '/dashboard',
      component: 'DashboardPage',
      title: 'Dashboard',
      requiresAuth: true,
    });

    this.addRoute({
      path: '/profile/:id',
      component: 'ProfilePage',
      title: 'Profile',
      requiresAuth: true,
    });

    this.addRoute({
      path: '/404',
      component: 'NotFoundPage',
      title: 'Page Not Found',
    });
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', _event => {
      this.handleRoute(window.location.pathname);
    });

    // Handle link clicks
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[data-route]');

      if (link) {
        event.preventDefault();
        const path =
          link.getAttribute('href') || link.getAttribute('data-route');
        if (path) {
          this.navigate(path);
        }
      }
    });
  }

  /**
   * Add a route
   */
  addRoute(route: Route): void {
    this.routes.push(route);
    this.logger.debug(`Added route: ${route.path} -> ${route.component}`);
  }

  /**
   * Navigate to a path
   */
  async navigate(path: string, pushState: boolean = true): Promise<void> {
    this.logger.debug(`Navigating to: ${path}`);

    if (pushState) {
      window.history.pushState(null, '', path);
    }

    await this.handleRoute(path);
  }

  /**
   * Handle a route
   */
  private async handleRoute(path: string): Promise<void> {
    const route = this.matchRoute(path);

    if (!route) {
      this.logger.warn(`No route found for path: ${path}`);
      await this.navigate('/404', false);
      return;
    }

    // Check authentication if required
    if (route.requiresAuth && !this.isAuthenticated()) {
      this.logger.warn(`Authentication required for route: ${path}`);
      await this.navigate('/login', false);
      return;
    }

    this.currentRoute = route;
    this.currentParams = this.extractParams(route.path, path);

    // Update page title
    if (route.title) {
      document.title = route.title;
    }

    // Render the component
    await this.renderComponent(route.component);

    this.logger.info(`Route handled: ${path} -> ${route.component}`);
  }

  /**
   * Match a path to a route
   */
  private matchRoute(path: string): Route | undefined {
    for (const route of this.routes) {
      if (this.pathMatches(route.path, path)) {
        return route;
      }
    }
    return undefined;
  }

  /**
   * Check if a path matches a route pattern
   */
  private pathMatches(pattern: string, path: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/:\w+/g, '([^/]+)') // Replace :param with capture group
      .replace(/\//g, '\\/'); // Escape forward slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Extract parameters from path
   */
  private extractParams(pattern: string, path: string): RouteParams {
    const params: RouteParams = {};

    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      if (patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1);
        params[paramName] = pathParts[i] || '';
      }
    }

    return params;
  }

  /**
   * Render a component
   */
  private async renderComponent(componentName: string): Promise<void> {
    const container = document.getElementById('main-content');
    if (!container) {
      throw new Error('Main content container not found');
    }

    // This is a placeholder - in a real app, you would dynamically import the component
    container.innerHTML = `
      <div class="page">
        <h2>${componentName}</h2>
        <p>This is the ${componentName} component.</p>
        <p>Current params: ${JSON.stringify(this.currentParams)}</p>
      </div>
    `;
  }

  /**
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    // Placeholder authentication check
    return localStorage.getItem('authToken') !== null;
  }

  /**
   * Get current route
   */
  getCurrentRoute(): Route | undefined {
    return this.currentRoute;
  }

  /**
   * Get current route parameters
   */
  getCurrentParams(): RouteParams {
    return { ...this.currentParams };
  }

  /**
   * Generate navigation links
   */
  generateNavigation(): string {
    const publicRoutes = this.routes.filter(
      route =>
        !route.requiresAuth &&
        !route.path.includes(':') &&
        route.path !== '/404'
    );

    return publicRoutes
      .map(
        route =>
          `<a href="${route.path}" data-route="${route.path}">${route.title || route.path}</a>`
      )
      .join(' | ');
  }
}

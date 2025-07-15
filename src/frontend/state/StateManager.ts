/**
 * State Manager
 *
 * This class manages the global application state using a simple
 * observer pattern for state updates and notifications.
 */

import { Logger } from '../utils/logger';

export interface AppState {
  user?: {
    id: string;
    name: string;
    email: string;
    isAuthenticated: boolean;
  };
  ui: {
    isLoading: boolean;
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
  };
  data: {
    [key: string]: any;
  };
}

export type StateListener<T = any> = (
  newValue: T,
  oldValue: T,
  path: string
) => void;

export class StateManager {
  private state: AppState;
  private listeners: Map<string, StateListener[]> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('StateManager');

    // Initialize default state
    this.state = {
      ui: {
        isLoading: false,
        theme: 'light',
        sidebarOpen: false,
      },
      data: {},
    };
  }

  /**
   * Initialize the state manager
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing state manager...');

    // Load state from localStorage if available
    await this.loadPersistedState();

    // Set up auto-save
    this.setupAutoSave();

    this.logger.info('State manager initialized successfully');
  }

  /**
   * Get the entire state or a specific path
   */
  getState(): AppState;
  getState<T>(path: string): T;
  getState<T>(path?: string): T | AppState {
    if (!path) {
      return this.state;
    }

    return this.getNestedValue(this.state, path);
  }

  /**
   * Set state at a specific path
   */
  setState<T>(path: string, value: T): void {
    const oldValue = this.getNestedValue(this.state, path);

    if (oldValue === value) {
      return; // No change
    }

    this.setNestedValue(this.state, path, value);
    this.notifyListeners(path, value, oldValue);

    this.logger.debug(`State updated at path: ${path}`, {
      oldValue,
      newValue: value,
    });
  }

  /**
   * Update state by merging with existing state
   */
  updateState(updates: Partial<AppState>): void {
    const oldState = { ...this.state };
    this.state = this.deepMerge(this.state, updates);

    // Notify listeners for all changed paths
    this.notifyAllListeners(oldState, this.state);

    this.logger.debug('State updated with merge', { updates });
  }

  /**
   * Subscribe to state changes at a specific path
   */
  subscribe<T>(path: string, listener: StateListener<T>): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, []);
    }

    this.listeners.get(path)!.push(listener);

    this.logger.debug(`Listener subscribed to path: ${path}`);

    // Return unsubscribe function
    return () => {
      const pathListeners = this.listeners.get(path);
      if (pathListeners) {
        const index = pathListeners.indexOf(listener);
        if (index > -1) {
          pathListeners.splice(index, 1);
          this.logger.debug(`Listener unsubscribed from path: ${path}`);
        }
      }
    };
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Notify listeners for a specific path
   */
  private notifyListeners<T>(path: string, newValue: T, oldValue: T): void {
    const pathListeners = this.listeners.get(path);
    if (pathListeners) {
      pathListeners.forEach(listener => {
        try {
          listener(newValue, oldValue, path);
        } catch (error) {
          this.logger.error(`Error in state listener for path ${path}:`, error);
        }
      });
    }
  }

  /**
   * Notify all listeners by comparing old and new state
   */
  private notifyAllListeners(oldState: AppState, newState: AppState): void {
    const allPaths = new Set([
      ...this.getAllPaths(oldState),
      ...this.getAllPaths(newState),
    ]);

    allPaths.forEach(path => {
      const oldValue = this.getNestedValue(oldState, path);
      const newValue = this.getNestedValue(newState, path);

      if (oldValue !== newValue) {
        this.notifyListeners(path, newValue, oldValue);
      }
    });
  }

  /**
   * Get all possible paths from an object
   */
  private getAllPaths(obj: any, prefix = ''): string[] {
    const paths: string[] = [];

    for (const key in obj) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      paths.push(currentPath);

      if (
        obj[key] &&
        typeof obj[key] === 'object' &&
        !Array.isArray(obj[key])
      ) {
        paths.push(...this.getAllPaths(obj[key], currentPath));
      }
    }

    return paths;
  }

  /**
   * Load persisted state from localStorage
   */
  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = localStorage.getItem('appState');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        this.state = this.deepMerge(this.state, parsed);
        this.logger.debug('Loaded persisted state');
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted state:', error);
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      // Only persist certain parts of state
      const persistableState = {
        user: this.state.user,
        ui: {
          theme: this.state.ui.theme,
          sidebarOpen: this.state.ui.sidebarOpen,
        },
      };

      localStorage.setItem('appState', JSON.stringify(persistableState));
    } catch (error) {
      this.logger.warn('Failed to save state:', error);
    }
  }

  /**
   * Set up automatic state saving
   */
  private setupAutoSave(): void {
    // Save state on certain UI changes
    this.subscribe('ui.theme', () => this.saveState());
    this.subscribe('ui.sidebarOpen', () => this.saveState());
    this.subscribe('user', () => this.saveState());

    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  /**
   * Reset state to default values
   */
  reset(): void {
    const oldState = { ...this.state };

    this.state = {
      ui: {
        isLoading: false,
        theme: 'light',
        sidebarOpen: false,
      },
      data: {},
    };

    this.notifyAllListeners(oldState, this.state);
    localStorage.removeItem('appState');

    this.logger.info('State reset to defaults');
  }

  /**
   * Get state statistics
   */
  getStats(): {
    listenerCount: number;
    stateSize: number;
    paths: string[];
  } {
    const stateString = JSON.stringify(this.state);
    return {
      listenerCount: Array.from(this.listeners.values()).reduce(
        (total, listeners) => total + listeners.length,
        0
      ),
      stateSize: stateString.length,
      paths: this.getAllPaths(this.state),
    };
  }
}

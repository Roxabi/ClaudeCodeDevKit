/**
 * Frontend State Management Index
 *
 * This file exports all the main state management components for easy importing.
 */

// State manager
export { StateManager } from './StateManager';
export type { AppState, StateListener } from './StateManager';

// Re-export for convenience
export default {
  StateManager,
};

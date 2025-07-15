/**
 * Frontend Components Index
 *
 * This file exports all the main frontend components for easy importing.
 */

// Base components
export { Component } from './Component';
export type { ComponentProps } from './Component';

// Main application components
export { App } from './App';
export type { AppConfig } from './App';

// Router component
export { Router } from './Router';
export type { Route, RouteParams } from './Router';

// Example component
export { ExampleComponent } from './ExampleComponent';
export type { ExampleComponentProps } from './ExampleComponent';

// Re-export for convenience
export default {
  Component,
  App,
  Router,
  ExampleComponent,
};

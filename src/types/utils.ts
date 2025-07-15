/**
 * Utility Types - Helper types for TypeScript development
 */

// Make all properties in T optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make specific properties optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Extract non-null values
export type NonNullable<T> = T extends null | undefined ? never : T;

// Create a type with only specific keys
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Create a type without specific keys
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type EventHandler<T = Event> = (event: T) => void;
export type Callback<T = void> = () => T;

// Array and object utilities
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type KeyOf<T> = keyof T;
export type ValueOf<T> = T[keyof T];

// String literal utilities
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// Conditional types
export type If<C extends boolean, T, F> = C extends true ? T : F;

/**
 * Common type definitions for Starlight project
 */

/**
 * Generic children prop type
 */
export type Children = React.ReactNode;

/**
 * Generic className prop type
 */
export type ClassName = string;

/**
 * Generic style prop type
 */
export type Style = React.CSSProperties;

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Generic nullable type
 */
export type Nullable<T> = T | null;

/**
 * Generic optional type
 */
export type Optional<T> = T | undefined;

/**
 * Generic async function return type
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : never;

/**
 * Extract keys from object type
 */
export type KeysOf<T> = keyof T;

/**
 * Extract values from object type
 */
export type ValuesOf<T> = T[keyof T];

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

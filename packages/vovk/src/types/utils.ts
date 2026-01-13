export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type IsEmptyObject<T> = T extends object
  ? keyof T extends never
    ? true // Empty object
    : T extends Partial<T>
      ? Partial<T> extends T
        ? true // All properties are optional
        : false
      : false
  : false;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type StaticClass = Function; // eslint-disable-line @typescript-eslint/no-unsafe-function-type

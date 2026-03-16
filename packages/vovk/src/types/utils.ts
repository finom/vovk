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

// biome-ignore lint/suspicious/noExplicitAny: this is an utility type, so any is expected
export type KnownAny = any;

export type StaticClass = Function;

export type IsAny<T> = 0 extends 1 & T ? true : false;

export type IsNotAny<T> = IsAny<T> extends true ? false : true;

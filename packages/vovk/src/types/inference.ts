import type { JSONLinesResponder } from '../core/JSONLinesResponder.js';
import type { VovkStreamAsyncIterable } from './client.js';
import type { VovkRequest } from './request.js';
import type { KnownAny } from './utils.js';

export type VovkControllerBody<T extends (...args: KnownAny[]) => unknown> = Awaited<
  ReturnType<Parameters<T>[0]['vovk']['body']>
>;

export type VovkControllerQuery<T extends (...args: KnownAny[]) => unknown> = ReturnType<
  Parameters<T>[0]['vovk']['query']
>;

export type VovkControllerParams<T extends (...args: KnownAny[]) => unknown> = Parameters<T>[1] extends object
  ? Parameters<T>[1]
  : ReturnType<Parameters<T>[0]['vovk']['params']>;

export type VovkControllerYieldType<T extends (req: VovkRequest<KnownAny, KnownAny>) => unknown> = T extends (
  ...args: KnownAny[]
) => AsyncGenerator<infer Y, unknown, unknown>
  ? Y
  : T extends (...args: KnownAny[]) => Generator<infer Y, unknown, unknown>
    ? Y
    : T extends (...args: KnownAny[]) => Promise<JSONLinesResponder<infer Y>> | JSONLinesResponder<infer Y>
      ? Y
      : never;

/**
 * Utility type to extract output from controller methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerOutput = VovkOutput<typeof MyController.myMethod>;
 * ```
 */
export type VovkOutput<T> = T extends { __types?: { output?: infer O } } ? O : unknown;

/**
 * Utility type to extract iteration (JSONLines output) from controller methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerIteration = VovkIteration<typeof MyController.myMethod>;
 * ```
 */
export type VovkIteration<T> = T extends {
  __types?: { iteration?: infer I };
}
  ? I
  : unknown;

export type VovkClientBody<T extends (opts: unknown) => unknown> = Parameters<T>[0] extends { body: infer B }
  ? B
  : undefined;

export type VovkClientQuery<T extends (opts: unknown) => unknown> = Parameters<T>[0] extends { query: infer Q }
  ? Q
  : undefined;

export type VovkClientParams<T extends (opts: unknown) => unknown> = Parameters<T>[0] extends { params: infer P }
  ? P
  : undefined;

export type VovkClientYieldType<T extends (...args: KnownAny[]) => unknown> = T extends (
  ...args: KnownAny[]
) => Promise<VovkStreamAsyncIterable<infer Y>>
  ? Y
  : never;

/**
 * Utility type to extract body from both controller and client methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerBody = VovkBody<typeof MyController.myMethod>;
 * ```
 */
export type VovkBody<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientBody<T>
  : VovkControllerBody<T>;

/**
 * Utility type to extract query from both controller and client methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerQuery = VovkQuery<typeof MyController.myMethod>;
 * ```
 */
export type VovkQuery<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientQuery<T>
  : VovkControllerQuery<T>;

/**
 * Utility type to extract params from both controller and client methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerParams = VovkParams<typeof MyController.myMethod>;
 * ```
 */
export type VovkParams<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientParams<T>
  : VovkControllerParams<T>;

/**
 * Utility type to extract yield type from both controller and client methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerYieldType = VovkYieldType<typeof MyController.myMethod>;
 * ```
 */
export type VovkYieldType<T extends (...args: KnownAny[]) => unknown> = T extends { isRPC: true }
  ? VovkClientYieldType<T>
  : VovkControllerYieldType<T>;

/**
 * Utility type to extract return type from both controller and client methods
 * @see https://vovk.dev/inference
 * @example
 * ```ts
 * type MyControllerReturnType = VovkReturnType<typeof MyController.myMethod>;
 * ```
 */
export type VovkReturnType<T extends (...args: KnownAny) => unknown> = Awaited<ReturnType<T>>;

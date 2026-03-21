import type { KnownAny } from '../types/utils.js';

/**
 * Metadata stored on a handler by HTTP decorators and custom decorators when used outside decorator context (via decorate).
 */
export type DecorateMetadata = {
  httpMethod?: string;
  path?: string;
  options?: KnownAny;
  decoratorAppliers?: ((controller: KnownAny, propertyKey: string) => void)[];
};

/**
 * Applies decorators to a handler without using decorator syntax.
 * Returns an object with `.handle()` to register the handler function.
 *
 * When the last argument is a procedure result (has `.handle`), its `.handle()` is proxied.
 * Otherwise, `.handle()` wraps a plain handler directly.
 *
 * @example With procedure
 * ```ts
 * static handleParams = decorate(
 *   put('x/{foo}/{bar}/y'),
 *   authGuard(null),
 *   procedure({ params: z.object({ foo: z.string(), bar: z.string() }) })
 * ).handle(async (req) => req.vovk.params());
 * ```
 *
 * @example Without procedure
 * ```ts
 * static getMethod = decorate(
 *   get(),
 * ).handle(async () => {
 *   return { method: 'get' };
 * });
 * ```
 */
export function decorate<H extends { handle: (...args: KnownAny[]) => KnownAny }>(
  ...args: [...unknown[], H]
): { handle: H['handle'] };
export function decorate(...args: unknown[]): { handle: <T extends (...args: KnownAny[]) => KnownAny>(fn: T) => T };
export function decorate(...args: unknown[]): KnownAny {
  if (args.length === 0) throw new Error('decorate() requires at least one argument');

  const last = args[args.length - 1];
  const hasProcedure =
    typeof last === 'function' && 'handle' in last && typeof (last as KnownAny).handle === 'function';
  const procedureResult = hasProcedure ? (last as KnownAny) : null;
  const decoratorFns = (hasProcedure ? args.slice(0, -1) : args) as ((
    target: KnownAny,
    propertyKeyOrContext?: unknown
  ) => KnownAny)[];

  for (const decoratorFn of decoratorFns) {
    if (typeof decoratorFn !== 'function') {
      throw new Error('All decorator arguments to decorate() must be functions');
    }
  }

  return {
    handle(fn: KnownAny) {
      const handler = procedureResult ? procedureResult.handle(fn) : fn;

      handler._decorateMetadata = handler._decorateMetadata ?? {};
      handler._decorateMetadata.decoratorAppliers = handler._decorateMetadata.decoratorAppliers ?? [];

      for (const decoratorFn of decoratorFns) {
        handler._decorateMetadata.decoratorAppliers.push(decoratorFn);
      }

      return handler;
    },
  };
}

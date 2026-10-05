import type { KnownAny } from '../types/utils.js';
import { decoratorMiddlewares } from './create-decorator.js';

/**
 * Metadata stored on a handler by HTTP decorators and custom decorators when used outside decorator context (via decorate).
 */
export type DecorateMetadata = {
  httpMethod?: string;
  path?: string;
  options?: KnownAny;
  decoratorAppliers?: ((controller: KnownAny, propertyKey: string) => void)[];
};

const decoratedControllers = new WeakSet<object>();
// what decorate() returns: a member that still holds it got no .handle() call, so it has no handler and no route
const unhandledDecorations = new WeakSet<object>();

/**
 * Applies the decorators decorate() keeps on the methods of a controller, bottom-up as stacked decorators are applied.
 * Runs once per controller, called by initSegment and deriveTools when they get the class.
 */
export function applyDecorateDecorators(controller: KnownAny) {
  if (decoratedControllers.has(controller)) return;
  for (const key of Object.getOwnPropertyNames(controller)) {
    if (unhandledDecorations.has(controller[key])) {
      throw new Error(`${controller.name}.${key} has no handler: call .handle() on what decorate() returns`);
    }
  }
  decoratedControllers.add(controller);
  for (const key of Object.getOwnPropertyNames(controller)) {
    const appliers = (controller[key]?._decorateMetadata as DecorateMetadata | undefined)?.decoratorAppliers ?? [];
    for (let i = appliers.length - 1; i >= 0; i--) {
      appliers[i](controller, key);
    }
  }
}

/**
 * Applies decorators without decorator syntax; `.handle()` registers the handler
 * (proxied when the last arg is a procedure result, wraps a plain handler otherwise).
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
    // a procedure here would be applied as a decorator: it calls its handler with the class and rejects, unhandled
    if ('definition' in decoratorFn && 'fn' in decoratorFn) {
      throw new Error(
        'decorate() takes procedure(...) last and without .handle(): call .handle() on what decorate() returns'
      );
    }
  }

  const decorated = {
    handle(fn: KnownAny) {
      if (typeof fn !== 'function') {
        throw new Error('decorate().handle() requires a handler function');
      }
      const handler = procedureResult ? procedureResult.handle(fn) : fn;

      handler._decorateMetadata = handler._decorateMetadata ?? {};
      handler._decorateMetadata.decoratorAppliers = handler._decorateMetadata.decoratorAppliers ?? [];

      for (const decoratorFn of decoratorFns) {
        handler._decorateMetadata.decoratorAppliers.push(decoratorFn);
      }

      // until the decorators are applied to the class, fn() runs the middlewares here, so no guard is skipped
      const middlewares = decoratorFns.flatMap((decoratorFn) => decoratorMiddlewares.get(decoratorFn) ?? []);
      if (middlewares.length) {
        handler.wrapper = middlewares.reduceRight(
          (next: (req: unknown, params: unknown) => unknown, middleware) => (req: unknown, params: unknown) =>
            middleware.handler.call(undefined, req, async () => await next(req, params), ...middleware.args),
          (req: unknown, params: unknown) => handler(req, params)
        );
      }

      return handler;
    },
  };
  unhandledDecorations.add(decorated);
  return decorated;
}

import type { KnownAny } from '../types/utils.js';
import { decoratorFactories, decoratorMiddlewares } from './create-decorator.js';

type DecoratorApplier = (controller: KnownAny, propertyKey: string) => unknown;

/**
 * Metadata stored on a handler by HTTP decorators and custom decorators when used outside decorator context (via decorate).
 */
export type DecorateMetadata = {
  httpMethod?: string;
  path?: string;
  options?: KnownAny;
  decoratorAppliers?: DecoratorApplier[];
};

// a controller whose decorators failed keeps the error: a decorator applied before it stays, so no segment may serve it
const decoratedControllers = new WeakMap<object, { error: unknown } | null>();
// what decorate() returns: a member that still holds it got no .handle() call, so it has no handler and no route
const unhandledDecorations = new WeakSet<object>();

const isThenable = (value: unknown) =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  typeof (value as { then?: unknown }).then === 'function';

// the position is the decorator's argument of decorate(), which an error names with the member
function applyDecorator(controller: KnownAny, key: string, decorator: DecoratorApplier, position: number) {
  const where = `${controller.name}.${key}: decorate() argument ${position}`;
  let result: unknown;
  try {
    result = decorator(controller, key);
  } catch (error) {
    throw new Error(`${where} threw: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  if (isThenable(result)) {
    // a middleware run as a decorator rejects: handled here, so no unhandled rejection is reported
    Promise.resolve(result).catch(() => {});
    throw new Error(`${where} returned a promise, so it is no decorator: wrap a middleware with createDecorator()`);
  }
}

/**
 * Applies the decorators decorate() keeps on the methods of a controller, bottom-up as stacked decorators are applied.
 * Runs once per controller, called by initSegment and deriveTools when they get the class.
 */
export function applyDecorateDecorators(controller: KnownAny) {
  if (decoratedControllers.has(controller)) {
    const failure = decoratedControllers.get(controller);
    if (failure) throw failure.error;
    return;
  }
  for (const key of Object.getOwnPropertyNames(controller)) {
    if (unhandledDecorations.has(controller[key])) {
      throw new Error(`${controller.name}.${key} has no handler: call .handle() on what decorate() returns`);
    }
  }
  decoratedControllers.set(controller, null);
  try {
    for (const key of Object.getOwnPropertyNames(controller)) {
      const appliers = (controller[key]?._decorateMetadata as DecorateMetadata | undefined)?.decoratorAppliers ?? [];
      for (let i = appliers.length - 1; i >= 0; i--) {
        applyDecorator(controller, key, appliers[i], i + 1);
      }
    }
  } catch (error) {
    decoratedControllers.set(controller, { error });
    throw error;
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

  for (const [i, decoratorFn] of decoratorFns.entries()) {
    if (typeof decoratorFn !== 'function') {
      throw new Error('All decorator arguments to decorate() must be functions');
    }
    // uncalled, a factory makes a decorator that nothing applies: a guard would never run
    const factoryName = decoratorFactories.get(decoratorFn);
    if (factoryName !== undefined) {
      throw new Error(
        factoryName
          ? `decorate() argument ${i + 1} is the factory ${factoryName}: call it, ${factoryName}(...)`
          : `decorate() argument ${i + 1} is a decorator factory: call it, and pass the decorator it returns`
      );
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

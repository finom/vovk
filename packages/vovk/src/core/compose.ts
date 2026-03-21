import type { KnownAny } from '../types/utils.js';

/**
 * Metadata stored on a handler by HTTP decorators and custom decorators when used outside decorator context (via compose).
 */
export type ComposeMetadata = {
  httpMethod?: string;
  path?: string;
  options?: KnownAny;
  decoratorAppliers?: ((controller: KnownAny, propertyKey: string) => void)[];
};

/**
 * Composes decorators and a handler/class into a single value.
 *
 * For method-level composition, decorators are stored and applied later by initSegment.
 * For class-level composition, decorators like prefix() and cloneControllerMetadata()
 * are applied immediately to the class in reverse order (matching stacked decorator semantics).
 *
 * @example Method-level
 * ```ts
 * static handleParams = compose(
 *   put('x/{foo}/{bar}/y'),
 *   authGuard(null),
 *   procedure({ params: z.object({ foo: z.string(), bar: z.string() }) })
 *     .handle(async (req) => req.vovk.params())
 * );
 * ```
 *
 * @example Class-level
 * ```ts
 * const MyController = compose(
 *   prefix('users'),
 *   cloneControllerMetadata(),
 *   class extends ParentController {}
 * );
 * export default MyController;
 * ```
 */
export function compose<T>(...args: [...unknown[], T]): T;
export function compose(...args: unknown[]): KnownAny {
  if (args.length === 0) throw new Error('compose() requires at least one argument');

  const last = args[args.length - 1];
  const decoratorFns = args.slice(0, -1) as ((target: KnownAny, propertyKeyOrContext?: unknown) => KnownAny)[];

  if (typeof last !== 'function') {
    throw new Error('The last argument to compose() must be a function, handler, or class');
  }

  for (const decoratorFn of decoratorFns) {
    if (typeof decoratorFn !== 'function') {
      throw new Error('All arguments to compose() except the last must be decorator functions');
    }
  }

  // Detect class: native ES class constructors' toString() starts with "class"
  if (last.toString().startsWith('class ')) {
    // Apply class decorators immediately in reverse order (bottom-up, matching stacked decorator semantics)
    let result: KnownAny = last;
    for (let i = decoratorFns.length - 1; i >= 0; i--) {
      const transformed = decoratorFns[i](result);
      if (transformed !== undefined) {
        result = transformed;
      }
    }
    return result;
  }

  // Method-level compose: store decorator appliers for deferred execution by initSegment
  const handler = last as ((...a: KnownAny[]) => KnownAny) & { _composeMetadata?: ComposeMetadata };
  handler._composeMetadata = handler._composeMetadata ?? {};
  handler._composeMetadata.decoratorAppliers = handler._composeMetadata.decoratorAppliers ?? [];

  for (const decoratorFn of decoratorFns) {
    handler._composeMetadata.decoratorAppliers.push(decoratorFn);
  }

  return handler;
}

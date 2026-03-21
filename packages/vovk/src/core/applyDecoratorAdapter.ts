import type { VovkController } from '../types/core.js';
import type { KnownAny } from '../types/utils.js';

/** TC39 Stage 3 decorator context. */
type Stage3Context = {
  kind: string;
  name: string | symbol;
  addInitializer: (fn: () => void) => void;
};

/** 2018-09 decorator proposal descriptor (SWC without experimentalDecorators). */
type Descriptor2018 = {
  kind: string;
  key: string | symbol;
  placement: string;
  descriptor: PropertyDescriptor;
  initializer?: () => unknown;
  finisher?: (klass: KnownAny) => void;
};

/**
 * Adapts a decorator callback to work with experimental, 2018-09, and TC39 Stage 3 decorator formats.
 * The callback receives (controller, propertyKey) when the class and field/method value are available.
 */
export function applyDecoratorAdapter(
  arg1: unknown,
  arg2: unknown,
  callback: (controller: VovkController, propertyKey: string) => void
): KnownAny {
  // Experimental decorators: (target, propertyKey: string)
  if (typeof arg2 === 'string') {
    callback(arg1 as VovkController, arg2);
    return;
  }

  // TC39 Stage 3: (value, context: { kind, name, addInitializer })
  if (typeof arg2 === 'object' && arg2 !== null && 'name' in arg2) {
    const ctx = arg2 as Stage3Context;
    const propertyKey = String(ctx.name);
    if (ctx.kind === 'field') {
      return function (this: KnownAny, initialValue: KnownAny) {
        (this as VovkController)[propertyKey] = initialValue;
        callback(this as VovkController, propertyKey);
        return (this as VovkController)[propertyKey];
      };
    }
    ctx.addInitializer(function (this: KnownAny) {
      callback(this as VovkController, propertyKey);
    });
    return;
  }

  // 2018-09 proposal: (descriptor: { kind, key, placement, initializer? })
  if (typeof arg1 === 'object' && arg1 !== null && 'kind' in arg1 && 'key' in arg1) {
    const desc = arg1 as Descriptor2018;
    const propertyKey = String(desc.key);
    if (desc.kind === 'field') {
      const origInit = desc.initializer;
      return {
        ...desc,
        initializer(this: KnownAny) {
          const value = origInit?.call(this);
          (this as VovkController)[propertyKey] = value;
          callback(this as VovkController, propertyKey);
          return (this as VovkController)[propertyKey];
        },
      };
    }
    return {
      ...desc,
      finisher(klass: KnownAny) {
        callback(klass as VovkController, propertyKey);
      },
    };
  }
}

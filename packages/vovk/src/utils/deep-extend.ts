/*!
 * @description Recursive object extending
 * @author Viacheslav Lotsmanov <lotsmanov89@gmail.com>
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2018 Viacheslav Lotsmanov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { KnownAny } from '../types/utils.js';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? DeepPartial<U>[] : T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// a Node Buffer is a Uint8Array, so the declaration needs no Node types
type SpecificValue = Date | RegExp | Uint8Array;

// Buffer is a Node global, a browser or React Native bundle has none
function isBuffer(val: unknown): val is Buffer {
  return typeof Buffer !== 'undefined' && val instanceof Buffer;
}

function isSpecificValue(val: KnownAny): val is SpecificValue {
  return isBuffer(val) || val instanceof Date || val instanceof RegExp;
}

// class instances like Headers or AbortSignal have no enumerable keys and must not be fake-cloned into {}
// the prototype is compared by shape, a config loaded in a VM has another realm's Object.prototype
function isPlainObject(val: object): boolean {
  const proto = Object.getPrototypeOf(val);
  return proto === null || Object.getPrototypeOf(proto) === null;
}

function cloneSpecificValue(val: SpecificValue): SpecificValue {
  if (isBuffer(val)) {
    return Buffer.from(val);
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
}

function deepCloneArray<T = KnownAny>(arr: T[]): T[] {
  const clone: T[] = [];
  arr.forEach((item, index) => {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item) as T;
      } else if (isSpecificValue(item)) {
        clone[index] = cloneSpecificValue(item) as T;
      } else if (!isPlainObject(item)) {
        clone[index] = item;
      } else {
        clone[index] = deepExtend({}, item) as T;
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function safeGetProperty<T extends object>(object: T, property: PropertyKey): KnownAny {
  return property === '__proto__' ? undefined : (object as KnownAny)[property];
}

// deep-extends the first argument in place, returns it (or false if target is not an object)
// to clone without modifying the source: deepExtend({}, yourObj)
function deepExtend<T extends object>(...args: [T, ...Partial<T>[]]): T;
function deepExtend<T extends object, U extends object>(target: T, source: U): T & U;
function deepExtend<T extends object, U extends object, V extends object>(target: T, source1: U, source2: V): T & U & V;
function deepExtend<T extends object, U extends object, V extends object, W extends object>(
  target: T,
  source1: U,
  source2: V,
  source3: W
): T & U & V & W;
function deepExtend<T extends object>(target: T, ...sources: KnownAny[]): T;
function deepExtend(...args: KnownAny[]): KnownAny {
  if (args.length < 1 || typeof args[0] !== 'object') {
    return false;
  }

  if (args.length < 2) {
    return args[0];
  }

  const target = args[0];
  const sources = args.slice(1);

  sources.forEach((obj: KnownAny) => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach((key: string) => {
      const old = safeGetProperty(target, key);
      const val = safeGetProperty(obj, key);

      // recursion prevention
      if (val === target) {
        return;
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;
        return;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return;
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return;
      } else if (!isPlainObject(val)) {
        target[key] = val;
        return;
      } else if (typeof old !== 'object' || old === null || Array.isArray(old) || !isPlainObject(old)) {
        target[key] = deepExtend({}, val);
        return;
      } else {
        target[key] = deepExtend(old, val);
        return;
      }
    });
  });

  return target;
}

export type { DeepPartial, SpecificValue };
export { cloneSpecificValue, deepCloneArray, deepExtend, isSpecificValue, safeGetProperty };

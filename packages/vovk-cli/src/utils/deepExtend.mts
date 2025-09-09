/* eslint-disable @typescript-eslint/no-explicit-any */
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

'use strict';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? DeepPartial<U>[] : T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type SpecificValue = Buffer | Date | RegExp;

function isSpecificValue(val: any): val is SpecificValue {
  return val instanceof Buffer || val instanceof Date || val instanceof RegExp;
}

function cloneSpecificValue(val: SpecificValue): SpecificValue {
  if (val instanceof Buffer) {
    const x = Buffer.alloc ? Buffer.alloc(val.length) : Buffer.from(val);
    val.copy(x);
    return x;
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
}

/**
 * Recursive cloning array.
 */
function deepCloneArray<T = any>(arr: T[]): T[] {
  const clone: T[] = [];
  arr.forEach((item, index) => {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item) as T;
      } else if (isSpecificValue(item)) {
        clone[index] = cloneSpecificValue(item) as T;
      } else {
        clone[index] = deepExtend({}, item) as T;
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
}

function safeGetProperty<T extends object>(object: T, property: PropertyKey): any {
  return property === '__proto__' ? undefined : (object as any)[property];
}

/**
 * Extending object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect type.
 *
 * If you wish to clone source object (without modify it), just use empty new
 * object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */
function deepExtend<T extends object>(...args: [T, ...Partial<T>[]]): T;
function deepExtend<T extends object, U extends object>(target: T, source: U): T & U;
function deepExtend<T extends object, U extends object, V extends object>(target: T, source1: U, source2: V): T & U & V;
function deepExtend<T extends object, U extends object, V extends object, W extends object>(
  target: T,
  source1: U,
  source2: V,
  source3: W
): T & U & V & W;
function deepExtend<T extends object>(target: T, ...sources: any[]): T;
function deepExtend(...args: any[]): any {
  if (args.length < 1 || typeof args[0] !== 'object') {
    return false;
  }

  if (args.length < 2) {
    return args[0];
  }

  const target = args[0];
  // convert arguments to array and cut off target object
  const sources = args.slice(1);

  sources.forEach((obj: any) => {
    // skip argument if isn't an object, is null, or is an array
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach((key: string) => {
      const src = safeGetProperty(target, key); // source value
      const val = safeGetProperty(obj, key); // new value

      // recursion prevention
      if (val === target) {
        return;
      } else if (typeof val !== 'object' || val === null) {
        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
        target[key] = val;
        return;
      }
      // just clone arrays (and recursive clone objects inside)
      else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return;
      }
      // custom cloning and overwrite for specific objects
      else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return;
      }
      // overwrite by new value if source isn't object or array
      else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        return;
      }
      // source value and new value is objects both, extending...
      else {
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });

  return target;
}

export default deepExtend;
export { deepExtend, deepCloneArray, isSpecificValue, cloneSpecificValue, safeGetProperty };
export type { DeepPartial, SpecificValue };

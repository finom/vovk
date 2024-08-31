import debounce from 'lodash/debounce.js';
import { KnownAny } from '../types.mjs';

export default function debounceWithArgs<T extends (...args: KnownAny[]) => KnownAny>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void | Promise<void> {
  const debouncedFunctions = new Map<string, ReturnType<typeof debounce>>();

  return (...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (!debouncedFunctions.has(key)) {
      debouncedFunctions.set(key, debounce(fn, wait));
    }

    const debouncedFn = debouncedFunctions.get(key);
    if (debouncedFn) {
      debouncedFn(...args);
    }
  };
}

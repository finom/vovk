import { KnownAny } from '../types';

/**
 * Compares the keys of two objects and returns the added and removed keys.
 * @param {Record<string, any>} obj1 - The first object
 * @param {Record<string, any>} obj2 - The second object
 * @returns {{ addedKeys: string[], removedKeys: string[] }}
 */
function compareKeys(
  obj1: Record<string, KnownAny>,
  obj2: Record<string, KnownAny>
): { addedKeys: string[]; removedKeys: string[] } {
  const keys1 = new Set(Object.keys(obj1));
  const keys2 = new Set(Object.keys(obj2));

  const addedKeys: string[] = [];
  const removedKeys: string[] = [];

  // Find added keys
  for (const key of keys2) {
    if (key === 'workers') continue;
    if (!keys1.has(key)) {
      addedKeys.push(key);
    }
  }

  // Find removed keys
  for (const key of keys1) {
    if (key === 'workers') continue;
    if (!keys2.has(key)) {
      removedKeys.push(key);
    }
  }

  return { addedKeys, removedKeys };
}

export default compareKeys;

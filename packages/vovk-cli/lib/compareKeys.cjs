/**
 * @type {(obj1: Record<string, any>, obj2: Record<string, any>) => { addedKeys: string[], removedKeys: string[] }}
 */
function compareKeys(obj1, obj2) {
  const keys1 = new Set(Object.keys(obj1));
  const keys2 = new Set(Object.keys(obj2));

  const addedKeys = [];
  const removedKeys = [];

  // Find added keys
  for (let key of keys2) {
    if (key === 'workers') continue;
    if (!keys1.has(key)) {
      addedKeys.push(key);
    }
  }

  // Find removed keys
  for (let key of keys1) {
    if (key === 'workers') continue;
    if (!keys2.has(key)) {
      removedKeys.push(key);
    }
  }

  return { addedKeys, removedKeys };
}

module.exports = compareKeys;

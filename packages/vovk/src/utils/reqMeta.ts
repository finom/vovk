import type { VovkRequest } from '../types';

const metaMap = new WeakMap();

export function reqMeta<T = Record<'mcpOutput' | (string & {}), unknown>>(
  req: Partial<VovkRequest>,
  meta?: T | null
): T {
  if (meta) {
    metaMap.set(req, { ...metaMap.get(req), ...meta });
  } else if (meta === null) {
    metaMap.delete(req);
  }

  return (metaMap.get(req) ?? {}) as T;
}

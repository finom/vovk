import type { KnownAny, VovkRequest } from '../types';

const metaMap = new WeakMap();

export default function reqMeta<T = Record<KnownAny, KnownAny>>(
  req: VovkRequest<KnownAny, KnownAny, KnownAny>,
  meta?: T | null
): T {
  if (meta) {
    metaMap.set(req, { ...metaMap.get(req), ...meta });
  } else if (meta === null) {
    metaMap.delete(req);
  }

  return (metaMap.get(req) ?? {}) as T;
}

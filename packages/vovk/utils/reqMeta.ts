import { VovkRequest } from 'vovk';
import { _KnownAny as KnownAny } from '../types';

const metadataMap = new WeakMap();

export default function reqMeta<T = Record<KnownAny, KnownAny>>(
  req: VovkRequest<KnownAny, KnownAny>,
  metadata?: T | null
): T {
  if (metadata) {
    metadataMap.set(req, { ...metadataMap.get(req), ...metadata });
  } else if (metadata === null) {
    metadataMap.delete(req);
  }

  return (metadataMap.get(req) ?? {}) as T;
}

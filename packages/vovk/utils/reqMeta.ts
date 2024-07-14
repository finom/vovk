import { VovkRequest } from 'vovk';
import { _KnownAny as KnownAny } from '../types';

const metadataMap = new WeakMap();

export default function reqMeta<T = KnownAny>(req: VovkRequest<KnownAny, KnownAny>, metadata?: T) {
  if (metadata) {
    metadataMap.set(req, { ...metadataMap.get(req), ...metadata });
  }
  return (metadataMap.get(req) ?? {}) as T;
}

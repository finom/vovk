import type { KnownAny, VovkRequest } from '../types.js';
import parseQuery from './parseQuery.js';

export default function reqQuery<T extends object | undefined>(req: VovkRequest<KnownAny, T>): T {
  return parseQuery(req.nextUrl.search) as NonNullable<T>;
}

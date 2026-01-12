import type { VovkRequest } from '../types.js';
import { parseQuery } from './parseQuery.js';

export function reqQuery<T extends object | undefined>(req: VovkRequest<unknown, T>): T {
  return parseQuery(req.nextUrl.search) as NonNullable<T>;
}

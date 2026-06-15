import type { VovkRequest } from '../types/request.js';
import { parseQuery } from './parse-query.js';

export function reqQuery<T extends object | undefined>(req: VovkRequest<unknown, T>): T {
  return parseQuery(req.nextUrl.search) as NonNullable<T>;
}

import type { VovkRequest } from '../types';
import parseQuery from './parseQuery';

export default function reqQuery<T extends object | undefined>(req: VovkRequest<unknown, T>): T {
  return parseQuery(req.nextUrl.search) as NonNullable<T>;
}

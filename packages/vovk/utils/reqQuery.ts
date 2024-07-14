import { _KnownAny as KnownAny } from '../types';
import { VovkRequest } from 'vovk';

export default function reqQuery<T extends Record<string, string | string[]> | undefined>(
  req: VovkRequest<KnownAny, T>
): T {
  type Query = NonNullable<T>;
  const entries = [...req.nextUrl.searchParams.entries()] as [string, string][];
  const query = entries.reduce((acc, [key, value]) => {
    if (!(key in acc)) {
      acc[key] = value;
    } else {
      if (Array.isArray(acc[key])) {
        acc[key].push(value);
      } else {
        acc[key] = [acc[key], value];
      }
    }
    return acc;
  }, {} as Query);

  return query;
}

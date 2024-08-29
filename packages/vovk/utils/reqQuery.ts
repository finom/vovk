import { ARRAY_QUERY_KEY } from '../client/clientizeController';
import { _KnownAny as KnownAny } from '../types';
import { VovkRequest } from 'vovk';

export default function reqQuery<T extends object | undefined>(req: VovkRequest<KnownAny, T>): T {
  type Query = NonNullable<T>;
  const queryArr = (req.nextUrl.searchParams.get(ARRAY_QUERY_KEY as keyof T) as string | undefined)?.split(',') ?? null;
  const entries = [...req.nextUrl.searchParams.entries()] as [string, string][];
  const query = entries.reduce(
    (acc, [key, value]) => {
      if (key === ARRAY_QUERY_KEY) return acc;
      if (queryArr?.includes(key)) {
        if (!(key in acc)) {
          acc[key] = [value];
        } else {
          (acc[key] as string[]).push(value);
        }
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string | string[]>
  );

  return query as Query;
}

import { VovkRequest } from 'vovk';
import { _KnownAny as KnownAny } from '../types';

const formMap = new WeakMap();

export default async function reqForm<T = KnownAny>(
  req: VovkRequest<KnownAny, KnownAny>,
): Promise<T> {
    if(formMap.has(req)) {
        return formMap.get(req) as T;
    }

    const body = await req.formData();
    const formData = Object.fromEntries(body.entries()) as T;

    formMap.set(req, formData);

  return formData;
}

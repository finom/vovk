import type { VovkRequest } from '../types/request.js';
import type { StandardToolV0 } from '../types/standard-tool.js';

export type DefaultModelOutput<T> = T | { error: string };

export type ToModelOutputDefaultFn = <TInput, TOutput>(
  result: TOutput | Error,
  tool: StandardToolV0<TInput, TOutput, unknown>,
  req: Pick<VovkRequest, 'vovk'> | null
) => Promise<DefaultModelOutput<TOutput>>;

const toBase64 = (buf: ArrayBuffer) =>
  typeof Buffer !== 'undefined'
    ? Buffer.from(buf).toString('base64')
    : btoa([...new Uint8Array(buf)].map((b) => String.fromCharCode(b)).join(''));

// a Response has no enumerable keys, so handing it to an SDK would serialize it as {} and leave the body unread
async function responseToData(res: Response): Promise<unknown> {
  const mimeType = res.headers.get('Content-Type')?.split(';')[0].trim() || '';

  if (mimeType === 'application/json' || mimeType.endsWith('+json')) {
    return res.json();
  }

  if (mimeType.startsWith('text/') || /xml|javascript|yaml/.test(mimeType)) {
    return res.text();
  }

  return { mimeType, data: toBase64(await res.arrayBuffer()) };
}

export const toModelOutputDefault: ToModelOutputDefaultFn = async <TInput, TOutput>(
  result: TOutput | Error,
  _tool: StandardToolV0<TInput, TOutput, unknown>,
  _req: Pick<VovkRequest, 'vovk'> | null
): Promise<DefaultModelOutput<TOutput>> => {
  if (result instanceof Error) return { error: result.message };
  if (result instanceof Response) return (await responseToData(result)) as TOutput;
  return result;
};

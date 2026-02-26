import { parseForm } from './parseForm.js';

const formTypes = ['multipart/form-data', 'application/x-www-form-urlencoded'];

/** Application MIME types that are parsed as text by parseBody. */
export const textTypes = [
  'application/xml',
  'application/xhtml+xml',
  'application/javascript',
  'application/x-javascript',
  'application/ecmascript',
  'application/yaml',
  'application/x-yaml',
  'application/graphql',
  'application/sql',
  'application/toml',
  'application/x-ndjson',
  'application/ndjson',
  'application/jsonl',
  'application/jsonlines',
  'application/x-jsonlines',
] as const;

export const textSuffixPattern = /\+(xml|text|yaml|json-seq)\b/;

const includes = (ct: string, types: readonly string[]) => types.some((t) => ct.includes(t));

export async function parseBody(
  req: Request
): Promise<Record<string, unknown> | FormData | URLSearchParams | string | File> {
  const contentType = req.headers?.get('content-type');

  // application/json or +json suffix types (e.g. application/ld+json, application/vnd.api+json) → object
  if (!contentType || contentType.includes('application/json') || contentType.includes('+json')) {
    const body = await req.json();
    req.json = () => Promise.resolve(body);
    return body;
  }

  // multipart/form-data → FormData
  if (includes(contentType, formTypes)) {
    const body = await req.formData();
    req.formData = () => Promise.resolve(body);
    return parseForm(body);
  }

  // text/* or known text-based application types → string
  if (contentType.startsWith('text/') || includes(contentType, textTypes) || textSuffixPattern.test(contentType)) {
    const body = await req.text();
    req.text = () => Promise.resolve(body);
    return body;
  }

  // Everything else (octet-stream, image/*, video/*, application/pdf, etc.) → File
  const disposition = req.headers?.get('content-disposition');
  const fileName = disposition?.match(/filename="(.+?)"/)?.[1] ?? 'file';
  const body = await req.blob();
  req.blob = () => Promise.resolve(body);
  return new File([body], fileName, { type: contentType });
}

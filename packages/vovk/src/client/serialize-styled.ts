import type { VovkHandlerSchema } from '../types/core.js';
import { encodeURIComponentWellFormed } from './serialize-query.js';

// OpenAPI's serialization of a query parameter or of a form body property
export type OpenAPIStyle = { style?: string; explode?: boolean };

// one name=value pair; a value of several parts joins them with the delimiter
type Field = { key: string; parts: string[]; delimiter: string };

const DELIMITERS: Record<string, string> = { form: ',', spaceDelimited: ' ', pipeDelimited: '|' };

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && !(value instanceof Date);

// a value with toJSON (a Date, a URL) is sent as JSON.stringify would write it
export const fromJSON = (value: unknown): unknown =>
  typeof (value as { toJSON?: unknown } | null)?.toJSON === 'function'
    ? (value as { toJSON: () => unknown }).toJSON()
    : value;

// an object as JSON, as JSON.stringify writes it; null and undefined are left out
const toPart = (given: unknown): string | null => {
  const value = fromJSON(given);
  if (value === null || value === undefined) return null;
  return isObject(value) ? JSON.stringify(value) : String(value);
};

// deepObject: a bracket for every nested key, an array item by its index
function toDeepFields(key: string, given: unknown): Field[] {
  const value = fromJSON(given);
  if (isObject(value)) return Object.entries(value).flatMap(([k, v]) => toDeepFields(`${key}[${k}]`, v));
  const part = toPart(value);
  return part === null ? [] : [{ key, parts: [part], delimiter: '' }];
}

function toFields(name: string, given: unknown, { style = 'form', explode = style === 'form' }: OpenAPIStyle): Field[] {
  const value = fromJSON(given);
  if (style === 'deepObject' && isObject(value)) return toDeepFields(name, value);
  const delimiter = DELIMITERS[style] ?? ',';
  if (isObject(value)) {
    // an array gives its items, an object its keys and values
    const entries = Array.isArray(value)
      ? value.map((item) => [name, toPart(item)] as const)
      : Object.entries(value).map(([key, item]) => [key, toPart(item)] as const);
    const kept = entries.filter((entry): entry is readonly [string, string] => entry[1] !== null);
    if (!kept.length) return [];
    if (explode) return kept.map(([key, part]) => ({ key, parts: [part], delimiter }));
    return [{ key: name, parts: Array.isArray(value) ? kept.map(([, part]) => part) : kept.flat(), delimiter }];
  }
  const part = toPart(value);
  return part === null ? [] : [{ key: name, parts: [part], delimiter }];
}

// a space is %20, the other delimiters stay as they are, so an encoded one inside a value isn't read as a delimiter
const encodeField = ({ key, parts, delimiter }: Field) =>
  `${encodeURIComponentWellFormed(key)}=${parts.map(encodeURIComponentWellFormed).join(delimiter === ' ' ? '%20' : delimiter)}`;

// an OpenAPI mixin method's query and urlencoded body go out in the styles its document declares
export function getStyledSerializers(handlerSchema: VovkHandlerSchema) {
  const { misc } = handlerSchema;
  if (!misc?.isOpenAPIMixin) return null;
  const queryStyles = (misc.queryStyles ?? {}) as Record<string, OpenAPIStyle>;
  const formStyles = (misc.formStyles ?? {}) as Record<string, OpenAPIStyle>;
  return {
    serializeQuery: (query: Record<string, unknown>) =>
      Object.entries(query)
        .flatMap(([name, value]) => toFields(name, value, queryStyles[name] ?? {}))
        .map(encodeField)
        .join('&'),
    // false when the property declares no style, so it's sent like any form value
    appendFormField: (form: URLSearchParams, name: string, value: unknown) => {
      if (!Object.hasOwn(formStyles, name)) return false;
      const fields = toFields(name, value, formStyles[name]);
      for (const { key, parts, delimiter } of fields) form.append(key, parts.join(delimiter));
      return true;
    },
  };
}

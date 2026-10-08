interface SamplerOptions {
  stripQuotes?: boolean;
  indent?: number;
  nestingIndent?: number;
}

// a key of JSON.stringify output loses its quotes when it's an identifier
// a scan, not a regex, so it stays linear on long runs of escaped quotes
const unquoteKeys = (json: string): string => {
  let result = '';
  let copied = 0;
  for (let start = 0; start < json.length; start++) {
    if (json[start] !== '"') continue;
    let end = start + 1;
    while (end < json.length && json[end] !== '"') end += json[end] === '\\' ? 2 : 1;
    if (json[end + 1] === ':') {
      const key = JSON.parse(json.slice(start, end + 1)) as string;
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
        result += json.slice(copied, start) + key;
        copied = end + 1;
      }
    }
    start = end;
  }
  return result + json.slice(copied);
};

export function objectToCode(obj: unknown, options?: SamplerOptions): string {
  const { stripQuotes = false, indent = 0, nestingIndent = 2 } = options || {};

  let result = JSON.stringify(obj, null, nestingIndent);

  if (stripQuotes) {
    result = unquoteKeys(result);
  }

  if (indent > 0) {
    const indentStr = ' '.repeat(indent);
    result = result
      .split('\n')
      .map((line, i) => (i === 0 ? line : indentStr + line))
      .join('\n');
  }

  return result;
}

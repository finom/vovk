interface SamplerOptions {
  stripQuotes?: boolean;
  indent?: number;
  nestingIndent?: number;
}

// a JSON string with its escapes; matched from the start of the text, every match is a whole string
const JSON_STRING = /"(?:[^"\\]|\\.)*"/g;

export function objectToCode(obj: unknown, options?: SamplerOptions): string {
  const { stripQuotes = false, indent = 0, nestingIndent = 2 } = options || {};

  let result = JSON.stringify(obj, null, nestingIndent);

  if (stripQuotes) {
    // a key loses its quotes only when it's an identifier
    result = result.replace(JSON_STRING, (token, offset: number) => {
      if (result[offset + token.length] !== ':') return token;
      const key = JSON.parse(token) as string;
      return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : token;
    });
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

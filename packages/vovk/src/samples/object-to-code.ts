interface SamplerOptions {
  stripQuotes?: boolean;
  indent?: number;
  nestingIndent?: number;
  quote?: '"' | "'";
}

export function objectToCode(obj: unknown, options?: SamplerOptions): string {
  const { stripQuotes = false, indent = 0, nestingIndent = 2, quote = '"' } = options || {};

  let result = JSON.stringify(obj, null, nestingIndent);

  if (quote === "'") {
    result = result.replace(/"([^"]*)"/g, (match, content) => {
      // a key is followed by a colon
      const matchIndex = result.indexOf(match);
      const afterMatch = result.substring(matchIndex + match.length);
      if (afterMatch.startsWith(':')) {
        return match;
      }
      const escaped = content.replace(/'/g, "\\'");
      return `'${escaped}'`;
    });
  }

  if (stripQuotes) {
    // a key loses its quotes only when it's an identifier
    const keyQuote = quote === "'" ? "'" : '"';
    const pattern = new RegExp(`${keyQuote}([a-zA-Z_$][a-zA-Z0-9_$]*)${keyQuote}:`, 'g');
    result = result.replace(pattern, '$1:');
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

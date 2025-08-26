import { KnownAny } from '../types';

interface SamplerOptions {
  stripQuotes?: boolean;
  indent?: number;
  nestingIndent?: number;
  quote?: '"' | "'";
}

export function getSampleFromObject(obj: KnownAny, options?: SamplerOptions): string {
  const { stripQuotes = false, indent = 0, nestingIndent = 2, quote = '"' } = options || {};

  // Use JSON.stringify with the nesting indent
  let result = JSON.stringify(obj, null, nestingIndent);

  // Replace double quotes with single quotes for string values if requested
  if (quote === "'") {
    // First, escape any existing single quotes in string values
    result = result.replace(/"([^"]*)"/g, (match, content) => {
      // Check if this is a key (followed by colon) or a value
      const matchIndex = result.indexOf(match);
      const afterMatch = result.substring(matchIndex + match.length);
      if (afterMatch.startsWith(':')) {
        // This is a key, keep it for now
        return match;
      }
      // This is a value, replace quotes and escape single quotes
      const escaped = content.replace(/'/g, "\\'");
      return `'${escaped}'`;
    });
  }

  // Strip quotes from keys if requested
  if (stripQuotes) {
    // Remove quotes from keys that are valid JavaScript identifiers
    // Keep quotes for keys with special characters (like 'x-foo', spaces, etc.)
    const keyQuote = quote === "'" ? "'" : '"';
    const pattern = new RegExp(`${keyQuote}([a-zA-Z_$][a-zA-Z0-9_$]*)${keyQuote}:`, 'g');
    result = result.replace(pattern, '$1:');
  }

  // Apply base indentation if specified
  if (indent > 0) {
    const indentStr = ' '.repeat(indent);
    result = result
      .split('\n')
      .map((line, i) => (i === 0 ? line : indentStr + line))
      .join('\n');
  }

  return result;
}

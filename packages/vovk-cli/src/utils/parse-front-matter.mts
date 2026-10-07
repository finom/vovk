import { parse } from 'yaml';

// the YAML block between "---" lines at the start of a template, split the way gray-matter split it
export function parseFrontMatter<T extends object = Record<string, unknown>>(
  input: string
): { data: T; content: string } {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  if (!text.startsWith('---') || text.charAt(3) === '-') {
    return { data: {} as T, content: text };
  }

  // the rest of the opening line names the language; JSON front matter is YAML too
  const lineBreak = text.slice(3).search(/\r?\n/);
  const rest = lineBreak === -1 ? '' : text.slice(3 + lineBreak);
  const closeIndex = rest.indexOf('\n---');
  if (closeIndex === -1) {
    return { data: (parse(rest) ?? {}) as T, content: '' };
  }

  let content = rest.slice(closeIndex + 4);
  if (content[0] === '\r') content = content.slice(1);
  if (content[0] === '\n') content = content.slice(1);
  // with Windows line endings the block ends in the "\r" before the closing line
  return { data: (parse(rest.slice(0, closeIndex).replace(/\r$/, '')) ?? {}) as T, content };
}

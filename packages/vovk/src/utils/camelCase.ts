import type { KnownAny } from '../types.js';

// Convert any value to string
function toString(value: KnownAny) {
  return value == null ? '' : String(value);
}

// Regex to match words (including Unicode letters & digits)
const reUnicodeWord = /[\p{Lu}]{2,}(?=[\p{Lu}][\p{Ll}]+[0-9]*|\b)|[\p{Lu}]?[\p{Ll}]+[0-9]*|[\p{Lu}]|[0-9]+/gu;

/**
 * Splits string into an array of words based on Unicode word boundaries
 * @param {string} str
 * @returns {string[]}
 */
function unicodeWords(str: string) {
  return str.match(reUnicodeWord) || [];
}

/**
 * Converts string to camel case.
 * @param {*} input - The value to convert to camel case.
 * @returns {string}
 */
export function camelCase(input: string) {
  const str = toString(input);
  // replace separators with space
  const sanitized = str.replace(/[\s_-]+/g, ' ').trim();
  const words = unicodeWords(sanitized);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

// lodash's word rules over Unicode classes: an ASCII name splits as in lodash, and a letter of any script stays
const UPPER = '[\\p{Lu}\\p{Lt}]';
const LOWER = '\\p{Ll}';
// letters without case, like CJK, and combining marks join the word around them
const MISC = '[\\p{Lo}\\p{Lm}\\p{Nl}\\p{Mn}\\p{Mc}]';
const BREAK = '[^\\p{L}\\p{Nl}\\p{Mn}\\p{Mc}\\p{Nd}]';

const reWord = new RegExp(
  [
    // an uppercase run before a break, the end or a capitalized word: "HTTP" in "HTTPResponse"
    `(?:${UPPER}|${MISC})+(?=${BREAK}|${UPPER}(?:${LOWER}|${MISC})|$)`,
    `${UPPER}?(?:${LOWER}|${MISC})+`,
    `${UPPER}+`,
    // an English ordinal is one word: "1st"
    '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
    '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
    '\\p{Nd}+',
  ].join('|'),
  'gu'
);

const capitalize = (word: string) => {
  const [first = '', ...rest] = word.toLowerCase();
  return first.toUpperCase() + rest.join('');
};

export function camelCase(input: string) {
  const words = String(input ?? '')
    .replace(/['’]/g, '')
    .match(reWord);
  return (words ?? []).map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word))).join('');
}

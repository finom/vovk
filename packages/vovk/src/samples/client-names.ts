// the module and handler names of the generated Python and Rust clients: copies of lodash's snakeCase and of
// vovk-python's toPythonIdentifier and vovk-rust's toRustIdent, which a test holds equal to the originals

// lodash's snakeCase (MIT): Latin letters lose their accents, then the words split where the case changes, at digits
// and at anything but letters
const LATIN_LETTER = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
// the Latin letters whose plain form isn't the letter without its marks
// biome-ignore format: a table
const PLAIN_LATIN_LETTERS: Record<string, string> = {
  Æ: 'Ae', æ: 'ae', Ð: 'D', ð: 'd', Ø: 'O', ø: 'o', Þ: 'Th', þ: 'th', ß: 'ss', Đ: 'D', đ: 'd', Ħ: 'H', ħ: 'h', ı: 'i',
  Ĳ: 'IJ', ĳ: 'ij', ĸ: 'k', Ŀ: 'L', ŀ: 'l', Ł: 'L', ł: 'l', ŉ: "'n", Ŋ: 'N', ŋ: 'n', Œ: 'Oe', œ: 'oe', Ŧ: 'T', ŧ: 't',
  ſ: 's',
};
const COMBINING_MARK = /[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]/g;
const APOSTROPHE = /['\u2019]/g;
const HAS_UNICODE_WORD = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
const ASCII_WORD = /[0-9A-Za-z\x80-\uffff]+/g;
// the apostrophes are gone by the time words split, so the contractions lodash matches are left out
const UNICODE_WORD = (() => {
  const upper = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
  const lower = 'a-z\\xdf-\\xf6\\xf8-\\xff';
  const breaks =
    '\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r' +
    '\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008' +
    '\\u2009\\u200a\\u202f\\u205f\\u3000';
  const misc = `[^\\ud800-\\udfff${breaks}\\d+\\u2700-\\u27bf${lower}${upper}]`;
  const lowerOrMisc = `(?:[${lower}]|${misc})`;
  const upperOrMisc = `(?:[${upper}]|${misc})`;
  const modifier = '(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?';
  const pair = '(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]';
  const variation = '[\\ufe0e\\ufe0f]?';
  const joined = `(?:\\u200d(?:[^\\ud800-\\udfff]|${pair})${variation}${modifier})*`;
  return new RegExp(
    [
      `[${upper}]?[${lower}]+(?=[${breaks}]|[${upper}]|$)`,
      `${upperOrMisc}+(?=[${breaks}]|[${upper}]${lowerOrMisc}|$)`,
      `[${upper}]?${lowerOrMisc}+`,
      `[${upper}]+`,
      '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
      '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
      '\\d+',
      `(?:[\\u2700-\\u27bf]|${pair})${variation}${modifier}${joined}`,
    ].join('|'),
    'g'
  );
})();

function snakeCase(name: string): string {
  const plain = name
    .replace(LATIN_LETTER, (letter) => PLAIN_LATIN_LETTERS[letter] ?? letter.normalize('NFD'))
    .replace(COMBINING_MARK, '')
    .replace(APOSTROPHE, '');
  const words = plain.match(HAS_UNICODE_WORD.test(plain) ? UNICODE_WORD : ASCII_WORD) ?? [];
  return words.map((word) => word.toLowerCase()).join('_');
}

// biome-ignore format: a word list
const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or',
  'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

function toPythonIdentifier(name: string): string {
  const identifier = name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^(?=[0-9])/, '_') || '_';
  return PYTHON_KEYWORDS.has(identifier) ? `${identifier}_` : identifier;
}

// biome-ignore format: a word list
const RUST_KEYWORDS = new Set([
  'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let',
  'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait',
  'true', 'type', 'unsafe', 'use', 'where', 'while', 'async', 'await', 'dyn', 'abstract', 'become', 'box', 'do', 'final',
  'macro', 'override', 'priv', 'typeof', 'unsized', 'virtual', 'yield', 'try', 'union',
]);

function toRustIdent(name: string): string {
  let ident = name.replace(/[^a-zA-Z0-9_]/g, '_');
  // "_" alone is reserved, and "" has nothing left to name
  if (!ident || /^_+$/.test(ident)) ident = `Empty${ident}`;
  if (/^[0-9]/.test(ident)) ident = `_${ident}`;
  return RUST_KEYWORDS.has(ident) ? `${ident}_` : ident;
}

// the name of a handler the module doesn't list, which comes after the module's own
function getUniqueName(
  handlerName: string,
  moduleHandlerNames: string[],
  toName: (name: string) => string,
  taken: string[] = []
): string {
  const used = new Set(taken);
  let unique = '';
  for (const name of new Set([...moduleHandlerNames, handlerName])) {
    const base = toName(name);
    unique = base;
    for (let i = 2; used.has(unique); i++) unique = `${base}_${i}`;
    if (name === handlerName) break;
    used.add(unique);
  }
  return unique;
}

// in schema order, a name already taken in the module gets the first free suffix: get_user_by_id, get_user_by_id_2;
// built once per handlers object, since each of a module's handlers asks for its name
function getModuleNames(
  handlers: object,
  cache: WeakMap<object, Map<string, string>>,
  toName: (name: string) => string,
  taken: string[] = []
): Map<string, string> {
  let names = cache.get(handlers);
  if (!names) {
    names = new Map();
    const used = new Set(taken);
    for (const name of Object.keys(handlers)) {
      const base = toName(name);
      let unique = base;
      for (let i = 2; used.has(unique); i++) unique = `${base}_${i}`;
      used.add(unique);
      names.set(name, unique);
    }
    cache.set(handlers, names);
  }
  return names;
}

const toPythonName = (name: string) => toPythonIdentifier(snakeCase(name));
const pythonMethodNames = new WeakMap<object, Map<string, string>>();

export const getPythonClassName = (rpcModuleName: string) => toPythonIdentifier(rpcModuleName);

export const getPythonMethodName = (handlerName: string, handlers: object) =>
  getModuleNames(handlers, pythonMethodNames, toPythonName).get(handlerName) ??
  getUniqueName(handlerName, Object.keys(handlers), toPythonName);

// the module imports functions named http_request and http_request_stream
const RUST_IMPORTS = ['http_request', 'http_request_stream'];
const toRustName = (name: string) => toRustIdent(snakeCase(name));
const rustFunctionNames = new WeakMap<object, Map<string, string>>();

export const getRustModuleName = (rpcModuleName: string) => toRustIdent(snakeCase(rpcModuleName));

export const getRustFunctionName = (handlerName: string, handlers: object) =>
  getModuleNames(handlers, rustFunctionNames, toRustName, RUST_IMPORTS).get(handlerName) ??
  getUniqueName(handlerName, Object.keys(handlers), toRustName, RUST_IMPORTS);

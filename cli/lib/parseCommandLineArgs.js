// @ts-check

/** @type {(str: string) => string} */
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/** @typedef {{ config?: string; project?: string; clientOut?: string; noNextDev?: true }} Flags */
/** @typedef {'dev' | 'build' | 'generate' | 'help'} Command */
function parseCommandLineArgs() {
  const args = process.argv.slice(2); // Slice off node and script path
  let command = /** @type {Command} */ null;
  /** @type {Flags} */
  const flags = {};
  /** @type {string[]} */
  const unparsedArgs = [];

  let isUnparsed = false;
  for (const arg of args) {
    if (arg === '--') {
      isUnparsed = true;
      continue;
    }

    if (isUnparsed) {
      unparsedArgs.push(arg);
    } else if (arg.startsWith('--')) {
      const [key, value = true] = arg.slice(2).split('=');
      const camelKey = /** @type {keyof Flags} */ (toCamelCase(key));
      // @ts-expect-error Type 'string | true | undefined' is not assignable to type 'undefined'. Why?
      flags[camelKey] = /** @type {Flags[keyof Flags]} */ (value);
    } else if (!command) {
      command = /** @type {Command} */ (arg);
    }
  }

  const restArgs = unparsedArgs.join(' ');

  return { command, flags, restArgs };
}

module.exports = parseCommandLineArgs;

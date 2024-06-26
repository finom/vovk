// @ts-check

/** @type {(str: string) => string} */
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/** @typedef {{ project?: string; clientOut?: string; nextDev?: true }} Flags */
/** @typedef {'dev' | 'build' | 'generate' | 'help'} Command */
/** @type {() => { command: Command | null; flags: Flags; restArgs: string }} */
function parseCommandLineArgs() {
  const args = process.argv.slice(2); // Slice off node and script path
  const unparsedIndex = args.indexOf('--');
  const commandArgs = unparsedIndex !== -1 ? args.slice(0, unparsedIndex) : args;
  const restArgs = unparsedIndex !== -1 ? args.slice(unparsedIndex + 1).join(' ') : '';

  let command = /** @type {Command | null} */ (null);
  /** @type {Flags} */
  const flags = {};

  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    if (arg.startsWith('--')) {
      /** @type {string} */
      let key = arg.slice(2);
      /** @type {string | true} */
      let value; // Assume flag is boolean unless a value is found

      if (arg.includes('=')) {
        [key, value] = arg.slice(2).split('=');
      } else if (i + 1 < commandArgs.length && !commandArgs[i + 1].startsWith('--')) {
        // Look ahead to next arg if it exists and is not a flag
        value = commandArgs[i + 1];
        i++; // Skip next arg since it's consumed as a value here
      } else {
        value = true;
      }

      const camelKey = /** @type {keyof Flags} */ (toCamelCase(key));
      // @ts-expect-error Type 'string | true | undefined' is not assignable to type 'undefined'. Why?
      flags[camelKey] = /** @type {Flags[keyof Flags]} */ (value);
    } else if (!command) {
      command = /** @type {Command} */ (arg);
    }
  }

  return { command, flags, restArgs };
}

module.exports = parseCommandLineArgs;

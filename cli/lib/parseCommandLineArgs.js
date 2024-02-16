// @ts-check

/** @type {(str: string) => string} */
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/** @typedef {{ config?: string; project?: string; clientOut?: string; noNextDev?: true }} Flags */
/** @typedef {'dev' | 'build' | 'generate' | 'help'} Command */
/** @type {() => { command: Command; flags: Flags; restArgs: string }} */
function parseCommandLineArgs() {
  let args = process.argv.slice(2); // Slice off node and script path
  const [argsStr, restArgs] = args.join(' ').split('--');
  args = argsStr.split(' ');
  let command = /** @type {Command | null} */ (null);
  /** @type {Flags} */
  const flags = {};
  /** @type {string[]} */

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      let value;

      // Look ahead to next arg if it exists and is not a flag or '--'
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        value = args[i + 1];
        i++; // Skip next arg since it's consumed as a value here
      } else {
        value = true; // No value means boolean flag
      }

      const camelKey = /** @type {keyof Flags} */ (toCamelCase(key));
      // @ts-expect-error Type 'string | true | undefined' is not assignable to type 'undefined'. Why?
      flags[camelKey] = /** @type {Flags[keyof Flags]} */ (value);
    } else if (!command) {
      command = /** @type {Command} */ (arg);
    }
  }

  if (!command) throw new Error('No command provided');

  return { command, flags, restArgs };
}

module.exports = parseCommandLineArgs;

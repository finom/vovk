/**
 * Converts a string to camelCase.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCased string.
 */
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

type Flags = { project?: string; clientOut?: string; nextDev?: true };
type Command = 'dev' | 'build' | 'generate' | 'help';

/**
 * Parses command line arguments.
 * @returns {{ command: Command | null; flags: Flags; restArgs: string }}
 */
function parseCommandLineArgs(): { command: Command | null; flags: Flags; restArgs: string } {
  const args = process.argv.slice(2); // Slice off node and script path
  const unparsedIndex = args.indexOf('--');
  const commandArgs = unparsedIndex !== -1 ? args.slice(0, unparsedIndex) : args;
  const restArgs = unparsedIndex !== -1 ? args.slice(unparsedIndex + 1).join(' ') : '';

  let command: Command | null = null;
  const flags: Flags = {};

  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    if (arg.startsWith('--')) {
      let key = arg.slice(2);
      let value: string | true; // Assume flag is boolean unless a value is found

      if (arg.includes('=')) {
        [key, value] = arg.slice(2).split('=') as [string, string | true];
      } else if (i + 1 < commandArgs.length && !commandArgs[i + 1].startsWith('--')) {
        // Look ahead to next arg if it exists and is not a flag
        value = commandArgs[i + 1];
        i++; // Skip next arg since it's consumed as a value here
      } else {
        value = true;
      }

      const camelKey = toCamelCase(key) as keyof Flags;
      // TS workaround
      flags[camelKey as 'project'] = value as string;
    } else if (!command) {
      command = arg as Command;
    }
  }

  return { command, flags, restArgs };
}

export default parseCommandLineArgs;

// without a project vovk-cli, the latest one runs through the package runner of the runtime that runs this bin
/**
 * @param {string[]} args
 * @param {Record<string, string | undefined>} [versions]
 * @param {string} [execPath]
 * @returns {[string, string[]]}
 */
export function getFallbackCommand(args, versions = process.versions, execPath = process.execPath) {
  if (versions.deno) return [execPath, ['run', '-A', 'npm:vovk-cli@latest', ...args]];
  if (versions.bun) return [execPath, ['x', 'vovk-cli@latest', ...args]];
  return ['npx', ['vovk-cli@latest', ...args]];
}

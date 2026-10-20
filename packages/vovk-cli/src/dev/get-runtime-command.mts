// the runtime that runs this CLI, so Next.js and the watcher run on it too
export function getRuntimeCommand(
  versions: NodeJS.ProcessVersions = process.versions,
  execPath = process.execPath
): string[] {
  if ('deno' in versions) return [execPath, 'run', '-A'];
  if ('bun' in versions) return [execPath, '--bun'];
  return [execPath];
}

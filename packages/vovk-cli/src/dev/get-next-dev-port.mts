// next dev listens on -p or --port over PORT, so the schema requests have to go there too
export function getNextDevPort(nextArgs: string[]) {
  let port: string | undefined;
  for (const [index, arg] of nextArgs.entries()) {
    if (arg === '-p' || arg === '--port') port = nextArgs[index + 1];
    else if (arg.startsWith('--port=')) port = arg.slice('--port='.length);
    else if (/^-p\d+$/.test(arg)) port = arg.slice('-p'.length);
  }
  return port;
}

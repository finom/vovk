#!/usr/bin/env node
// no static imports: on an older Node.js a dependency throws while it loads, before this check could run
const MIN_NODE = [24, 15];

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < MIN_NODE[0] || (major === MIN_NODE[0] && minor < MIN_NODE[1])) {
  // Bun and Deno report the Node.js version they are compatible with
  const host = process.versions.bun
    ? ` in Bun ${process.versions.bun}`
    : process.versions.deno
      ? ` in Deno ${process.versions.deno}`
      : '';
  console.error(
    `[[v]] ❌ vovk-cli needs Node.js ${MIN_NODE.join('.')} or later (found ${process.versions.node}${host})`
  );
  process.exit(1);
}

await import('./cli.mjs');

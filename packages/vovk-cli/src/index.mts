#!/usr/bin/env node
// no static imports: on an older Node.js a dependency throws while it loads, before this check could run
const MIN_NODE = [24, 15];

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < MIN_NODE[0] || (major === MIN_NODE[0] && minor < MIN_NODE[1])) {
  console.error(`🐺 ❌ vovk-cli needs Node.js ${MIN_NODE.join('.')} or later (found ${process.versions.node})`);
  process.exit(1);
}

await import('./cli.mjs');

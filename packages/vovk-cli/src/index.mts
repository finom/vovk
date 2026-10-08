#!/usr/bin/env node
// no static imports: on an older Node.js a dependency throws while it loads, before this check could run
const MIN_NODE_MAJOR = 24;

if (Number(process.versions.node.split('.')[0]) < MIN_NODE_MAJOR) {
  console.error(`🐺 ❌ vovk-cli needs Node.js ${MIN_NODE_MAJOR} or later (found ${process.versions.node})`);
  process.exit(1);
}

await import('./cli.mjs');

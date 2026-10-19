import { glob, globSync } from 'tinyglobby';

// fast-glob neither expands directory patterns nor ends directory paths with a slash
const options = (o) => ({ expandDirectories: false, ...o });
const trim = (paths) => paths.map((p) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p));

const fg = async (patterns, o) => trim(await glob(patterns, options(o)));
fg.sync = (patterns, o) => trim(globSync(patterns, options(o)));
fg.glob = fg;
fg.globSync = fg.sync;

export default fg;

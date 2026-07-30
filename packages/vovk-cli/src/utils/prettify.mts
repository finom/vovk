import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { getLogger } from './get-logger.mjs';

type Prettier = {
  resolveConfig: (filepath: string) => Promise<object | null>;
  format: (code: string, options: object) => Promise<string>;
};

let prettierPromise: Promise<Prettier | null> | undefined;
let warned = false;

/** Prettier is not a CLI dependency; it's resolved from the user's project if installed. */
function getPrettier() {
  prettierPromise ??= (async () => {
    try {
      const require = createRequire(path.join(process.cwd(), 'noop.js'));
      const mod = (await import(pathToFileURL(require.resolve('prettier')).href)) as { default?: Prettier } & Prettier;
      return mod.default ?? mod;
    } catch {
      return null;
    }
  })();

  return prettierPromise;
}

/** Formats with the project-installed prettier; returns the code unchanged when it's not installed. */
export async function prettify(code: string, absoluteFilePath: string) {
  const prettier = await getPrettier();

  if (!prettier) return code;

  const options = await prettier.resolveConfig(absoluteFilePath);

  const finalOptions = {
    ...options,
    filepath: absoluteFilePath, // for selecting the correct parser
  };

  try {
    return await prettier.format(code, finalOptions);
  } catch (error) {
    // no parser for this file type (.rs, .toml, .py etc)
    if ((error as Error).name === 'UndefinedParserError') return code;
    throw error;
  }
}

/** Warns once per run when prettifyClient is enabled but prettier is not installed. */
export async function warnIfPrettierMissing(log: ReturnType<typeof getLogger>) {
  if (warned || (await getPrettier())) return;
  warned = true;
  log.warn(
    'prettifyClient is enabled but prettier is not installed. Either install it or set prettifyClient to false to suppress this warning.'
  );
}

import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { getLogger } from './get-logger.mjs';

type Prettier = {
  resolveConfig: (filepath: string) => Promise<object | null>;
  format: (code: string, options: object) => Promise<string>;
};

let prettierPromise: Promise<Prettier | null> | undefined;
let warningPromise: Promise<void> | undefined;

// prettier isn't a CLI dependency, it comes from the project when installed
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

// returns the code unchanged when the project has no prettier
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

// warns once per process, also when files render in parallel
export function warnIfPrettierMissing(log: ReturnType<typeof getLogger>) {
  warningPromise ??= getPrettier().then((prettier) => {
    if (prettier) return;
    log.warn(
      'prettifyClient is enabled but prettier is not installed. Either install it or set prettifyClient to false to suppress this warning.'
    );
  });

  return warningPromise;
}

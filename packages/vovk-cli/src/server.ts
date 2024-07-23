import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import generateClient from './generateClient';
import getVars from './getVars';
import isEqual from './lib/isEqual';
import compareKeys from './lib/compareKeys';
import type { VovkMetadata } from 'vovk';
import { VovkEnv } from './types';

type MetadataDiff = {
  controllers: { addedKeys: string[]; removedKeys: string[] };
  workers: { addedKeys: string[]; removedKeys: string[] };
};

/**
 * Write metadata to a file
 * @param {VovkMetadata} metadata
 * @returns {Promise<{ written: boolean; path: string; diff?: MetadataDiff; }>}
 */
const writeMetadata = async (
  metadata: VovkMetadata
): Promise<{ written: boolean; path: string; diff?: MetadataDiff }> => {
  const { VOVK_METADATA_OUT } = await getVars();
  await fs.mkdir(path.dirname(VOVK_METADATA_OUT), { recursive: true });
  const existingMetadataStr = await fs.readFile(VOVK_METADATA_OUT, 'utf-8').catch(() => 'null');
  const existingMetadata = JSON.parse(existingMetadataStr) as VovkMetadata;

  if (isEqual(existingMetadata, metadata)) {
    return { written: false, path: VOVK_METADATA_OUT };
  }

  await fs.writeFile(VOVK_METADATA_OUT, JSON.stringify(metadata, null, 2));

  return {
    written: true,
    path: VOVK_METADATA_OUT,
    diff: {
      controllers: compareKeys(existingMetadata, metadata),
      workers: compareKeys(existingMetadata.workers ?? {}, metadata.workers ?? {}),
    },
  };
};

const writeEmptyMetadata = async (): Promise<void> => {
  const { VOVK_METADATA_OUT } = await getVars();
  await fs.mkdir(path.dirname(VOVK_METADATA_OUT), { recursive: true });
  const existingMetadata = await fs.readFile(VOVK_METADATA_OUT, 'utf-8').catch(() => null);
  if (!existingMetadata) await fs.writeFile(VOVK_METADATA_OUT, '{}');
};

/**
 * Show the difference between added and removed keys
 * @param {{ addedKeys: string[]; removedKeys: string[]; constantName: string; }} param0
 */
const showDiff = ({
  addedKeys,
  removedKeys,
  constantName,
}: {
  addedKeys: string[];
  removedKeys: string[];
  constantName: string;
}): void => {
  if (!addedKeys.length && !removedKeys.length) return;
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
  };

  console.info(` const ${constantName} = {`);
  console.info('   // ...');
  addedKeys.forEach((key) => {
    console.info(`   ${colors.green}+ ${key},${colors.reset}`);
  });
  removedKeys.forEach((key) => {
    console.info(`   ${colors.red}- ${key},${colors.reset}`);
  });
  console.info(' };');
};

let is404Reported = false;

const pingNoDebounce = async (): Promise<void> => {
  const env = await getVars();
  let prefix = env.VOVK_PREFIX;
  prefix = prefix.startsWith('http://')
    ? prefix
    : `http://localhost:${env.PORT}/${prefix.startsWith('/') ? prefix.slice(1) : prefix}`;
  const endpoint = `${prefix.endsWith('/') ? prefix.slice(0, -1) : prefix}/_vovk-ping_`;
  const req = http.get(endpoint, (resp) => {
    if (!is404Reported && resp.statusCode === 404) {
      console.info(
        ` 🐺 🟡 Vovk Metadata Server is running fine but it seems like the wildcard route file is not created yet. See https://vovk.dev/getting-started for more information.`
      );
      is404Reported = true;
    }
  });

  req.on('error', (err) => {
    console.error(` 🐺 ❌ Error during HTTP request made to ${endpoint}:`, err.message);
  });
};

// eslint-disable-next-line no-undef
let timer: NodeJS.Timeout;

const ping = (): void => {
  clearTimeout(timer);
  timer = setTimeout(() => void pingNoDebounce(), 1000);
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/__metadata') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    req.on('end', async () => {
      try {
        const { metadata }: { metadata: VovkMetadata } = JSON.parse(body);
        const env = await getVars();
        const metadataWritten = metadata
          ? await writeMetadata(metadata)
          : { written: false, path: env.VOVK_METADATA_OUT };
        const codeWritten = await generateClient(env);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('JSON data received and file created');
        if (metadataWritten.written) {
          console.info(` 🐺 JSON metadata updated in ${metadataWritten.path}`);
        }

        if (codeWritten.written) {
          const { diff } = metadataWritten;

          if (diff) {
            showDiff({
              addedKeys: diff.controllers.addedKeys,
              removedKeys: diff.controllers.removedKeys,
              constantName: 'controllers',
            });
            showDiff({
              addedKeys: diff.workers.addedKeys,
              removedKeys: diff.workers.removedKeys,
              constantName: 'workers',
            });
            console.info(
              ` 🐺 Client generated in ${codeWritten.path}. Don't forget to restart TypeScript server in your code editor if needed.`
            );
          } else {
            console.info(` 🐺 Client generated in ${codeWritten.path}.`);
          }
        }
      } catch (e) {
        const err = e as Error;
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(err?.message ?? 'Error');
        console.error(' 🐺 ❌ ' + err?.message);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const handleFileChange = async (filename: string): Promise<void> => {
  try {
    const stats = await fs.lstat(filename);
    if (stats.isFile()) {
      const fileContent = await fs.readFile(filename, 'utf-8');
      const importRegex =
        /import\s*{[^}]*\b(initVovk|get|post|put|del|head|options|worker)\b[^}]*}\s*from\s*['"]vovk['"]/;
      if (importRegex.test(fileContent)) ping();
    }
  } catch {
    // ignore
  }
};

const watchControllers = async (srcRoot: string): Promise<void> => {
  for await (const info of fs.watch(srcRoot, { recursive: true })) {
    if (info.filename && (info.filename.endsWith('.ts') || info.filename.endsWith('.tsx'))) {
      const filename = path.join(srcRoot, info.filename);
      await handleFileChange(filename);
    }
  }
};

const watchRouteFile = async (routePath: string): Promise<void> => {
  for await (const info of fs.watch(routePath)) {
    if (info.filename) {
      await handleFileChange(routePath);
    }
  }
};

const startVovkServer = ({ VOVK_PORT, VOVK_MODULES_DIR, VOVK_ROUTE }: Required<VovkEnv>): void => {
  if (!VOVK_PORT) {
    console.error(' 🐺 Unable to run Vovk Metadata Server: no port specified');
    process.exit(1);
  }
  server.listen(VOVK_PORT, () => {
    console.info(
      ` 🐺 Vovk Metadata Server is running on port ${VOVK_PORT}. Watching modules directory at ${VOVK_MODULES_DIR} and route file at ${VOVK_ROUTE}. Happy coding!`
    );
  });

  void writeEmptyMetadata();

  setTimeout(ping, 3000);
  void watchControllers(VOVK_MODULES_DIR);
  void watchRouteFile(VOVK_ROUTE);
};

if (process.env.__VOVK_START_SERVER__) {
  void getVars().then(startVovkServer);
}

export { startVovkServer };

import path from 'node:path';
import fs from 'node:fs/promises';
import type { ProjectInfo } from '../getProjectInfo/index.mjs';

export default async function ensureClient(projectInfo: ProjectInfo) {
  const { config, cwd, log } = projectInfo;
  const now = Date.now();
  const clientoOutDirAbsolutePath = path.join(cwd, config.clientOutDir);
  const dts = `// auto-generated
// This is a temporary placeholder to avoid errors if client is imported before it's generated.
// If you still see this text, the client is not generated yet because of an unknown problem.
// Feel free to report an issue at https://github.com/finom/vovk/issues`;
  const js = dts;
  const ts = dts;

  const localJsAbsolutePath = path.join(clientoOutDirAbsolutePath, 'client.js');
  const localDtsAbsolutePath = path.join(clientoOutDirAbsolutePath, 'client.d.ts');
  const localTsAbsolutePath = path.join(clientoOutDirAbsolutePath, 'index.ts');
  const existingJs = await fs.readFile(localJsAbsolutePath, 'utf-8').catch(() => null);
  const existingDts = await fs.readFile(localDtsAbsolutePath, 'utf-8').catch(() => null);
  const existingTs = await fs.readFile(localTsAbsolutePath, 'utf-8').catch(() => null);

  if (existingJs && existingDts && existingTs) {
    return { written: false, path: clientoOutDirAbsolutePath };
  }

  await fs.mkdir(clientoOutDirAbsolutePath, { recursive: true });
  if (!existingJs) await fs.writeFile(localJsAbsolutePath, js);
  if (!existingDts) await fs.writeFile(localDtsAbsolutePath, dts);
  if (!existingTs) await fs.writeFile(localTsAbsolutePath, ts);

  log.info(`Empty client files are generated in ${Date.now() - now}ms`);

  return { written: true, path: clientoOutDirAbsolutePath };
}

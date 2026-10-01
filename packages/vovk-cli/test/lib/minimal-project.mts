import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const cliPath = path.join(import.meta.dirname, '../../dist/index.mjs');

// generate, new and dev read and write plain files, so these projects need neither Next.js nor an install
export async function createProject(projectDir: string, files: Record<string, string | object>) {
  await fs.rm(projectDir, { recursive: true, force: true });
  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(projectDir, file);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  }
}

export function runCLI(args: string[], { cwd, env }: { cwd: string; env?: NodeJS.ProcessEnv }) {
  return promisify(execFile)(process.execPath, [cliPath, ...args], { cwd, env: { ...process.env, ...env } });
}

// for commands that keep running, such as dev
export function startCLI(args: string[], { cwd, env }: { cwd: string; env?: NodeJS.ProcessEnv }) {
  const child = spawn(process.execPath, [cliPath, ...args], { cwd, env: { ...process.env, ...env } });
  let output = '';
  const listeners = new Set<() => void>();
  const onData = (data: Buffer) => {
    output += data.toString();
    for (const listener of listeners) listener();
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  const exitCode = new Promise<number | null>((resolve) => child.on('close', resolve));

  return {
    getOutput: () => output,
    exitCode,
    waitForOutput(pattern: RegExp, timeoutMs = 20_000) {
      return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          listeners.delete(check);
          reject(new Error(`Timed out waiting for ${pattern}. Output:\n${output}`));
        }, timeoutMs);
        const check = () => {
          if (!pattern.test(output)) return;
          clearTimeout(timer);
          listeners.delete(check);
          resolve();
        };
        listeners.add(check);
        check();
      });
    },
    async stop() {
      if (child.exitCode === null) child.kill();
      await exitCode;
    },
  };
}

export const userSegmentSchema = {
  $schema: 'https://vovk.dev/api/schema/v3/segment.json',
  emitSchema: true,
  segmentName: '',
  segmentType: 'segment',
  controllers: {
    UserRPC: {
      rpcModuleName: 'UserRPC',
      originalControllerName: 'UserController',
      prefix: 'users',
      handlers: {
        getUser: { httpMethod: 'GET', path: '{id}', validation: {} },
      },
    },
  },
};

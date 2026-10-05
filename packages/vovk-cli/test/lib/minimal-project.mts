import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
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
    // since: an output length, to wait for output printed after that point
    waitForOutput(pattern: RegExp, timeoutMs = 20_000, since = 0) {
      return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          listeners.delete(check);
          reject(new Error(`Timed out waiting for ${pattern}. Output:\n${output}`));
        }, timeoutMs);
        const check = () => {
          if (!pattern.test(output.slice(since))) return;
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

export const makeSegmentSchema = (segmentName: string, rpcModuleName = 'UserRPC') => ({
  ...userSegmentSchema,
  segmentName,
  controllers: { [rpcModuleName]: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName } },
});

// answers GET /api/<segment>/_schema_ the way a Next.js dev server with vovk segments does
export async function startSchemaServer(schemas: Record<string, object>) {
  const requests: string[] = [];
  const server = http.createServer((req, res) => {
    requests.push(req.url ?? '');
    const match = req.url?.match(/^\/api\/(?:(.+)\/)?_schema_$/);
    const schema = match ? schemas[match[1] ?? ''] : undefined;
    res.writeHead(schema ? 200 : 404, { 'content-type': 'application/json' });
    res.end(JSON.stringify(schema ? { schema } : { error: 'Not found' }));
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));

  return {
    port: String((server.address() as AddressInfo).port),
    requests,
    close: () => {
      server.closeAllConnections();
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

// an npm registry, such as a company mirror, that has only the given packages and their dist-tags
export async function startRegistry(packages: Record<string, Record<string, string>>) {
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname.slice(1));
    const tags = packages[name];
    const versions = Object.fromEntries(Object.values(tags ?? {}).map((version) => [version, { name, version }]));
    res.writeHead(tags ? 200 : 404, { 'content-type': 'application/json' });
    res.end(JSON.stringify(tags ? { name, 'dist-tags': tags, versions } : { error: 'Not found' }));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/`,
    close: () => {
      server.closeAllConnections();
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

// a port nothing listens on
export async function getFreePort() {
  const server = http.createServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise((resolve) => server.close(resolve));
  return String(port);
}

// node_modules/.bin/next for a project without Next.js: `next dev` answers the schema requests on -p, --port or PORT
export function getFakeNextBin(schemas: Record<string, object>) {
  return `#!/usr/bin/env node
import('node:http').then(({ default: http }) => {
  const args = process.argv.slice(2);
  const portIndex = args.findIndex((arg) => arg === '-p' || arg === '--port');
  const port = portIndex === -1 ? process.env.PORT : args[portIndex + 1];
  const schemas = ${JSON.stringify(schemas)};
  http
    .createServer((req, res) => {
      const match = req.url.match(/^\\/api\\/(?:(.+)\\/)?_schema_$/);
      const schema = match ? schemas[match[1] ?? ''] : undefined;
      res.writeHead(schema ? 200 : 404, { 'content-type': 'application/json' });
      res.end(JSON.stringify(schema ? { schema } : { error: 'Not found' }));
    })
    .listen(Number(port), () => console.log('next dev listens on ' + port));
});
`;
}

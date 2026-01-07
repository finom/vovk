/* global NodeJS */
import * as pty from 'node-pty';

async function runInputs(combo: string[], child: pty.IPty) {
  for (const input of combo) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    child.write(input);
  }
}

export const DOWN = '\x1B\x5B\x42';
export const UP = '\x1B\x5B\x41';
export const ENTER = '\x0D';
export const SPACE = '\x20';

export function runScript(
  commandWithArgs: string,
  options: {
    env?: NodeJS.ProcessEnv;
    combo?: string[];
    cwd: string;
  } = {
    cwd: process.cwd(),
  }
) {
  // eslint-disable-next-line no-console
  console.info('Running script: ', commandWithArgs, ' at ', options.cwd);
  const { env = process.env, combo = [] } = options;

  const envWithPath = {
    ...process.env,
    PATH: process.env.PATH, // Explicitly set PATH
    ...env, // Include any additional env vars passed in options
  };

  const child = pty.spawn('sh', ['-c', commandWithArgs], {
    env: envWithPath as { [key: string]: string },
    cwd: options.cwd,
    cols: 80,
    rows: 30,
  });

  void runInputs(combo, child);

  const promise = new Promise((resolve, reject) => {
    let result = '';
    child.onData((data) => {
      process.stdout.write(data); // Output data immediately
      result += data; // Accumulate data if needed
    });

    child.onExit((exitCode) => {
      setTimeout(() => {
        if (exitCode.exitCode === 0) {
          resolve(result); // Resolve with the accumulated result
        } else {
          reject(
            new Error(
              `Command "${commandWithArgs}" (cwd=${options.cwd}) exited with code ${exitCode.exitCode}\nOutput:\n${result || 'no output'}`
            )
          );
        }
      }, 100);
    });
  }) as Promise<string> & { kill: () => Promise<void> };

  promise.kill = async () => {
    child.kill('SIGKILL');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return promise;
}

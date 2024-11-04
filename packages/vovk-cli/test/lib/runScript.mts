/* global NodeJS */
import * as pty from 'node-pty';

// TODO comments
async function runInputs(inputs: string[], child: pty.IPty) {
  for (const input of inputs) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    child.write(input);
  }
}

export const DOWN = '\x1B\x5B\x42';
export const UP = '\x1B\x5B\x41';
export const ENTER = '\x0D';

export function runScript(
  commandWithArgs: string,
  options: {
    env?: NodeJS.ProcessEnv;
    inputs?: string[]; // TODO rename to combo
    cwd: string;
  } = {
    cwd: process.cwd(),
  }
) {
  // eslint-disable-next-line no-console
  console.info('Running script:', commandWithArgs);
  const { env = process.env, inputs = [] } = options;

  const envWithPath = {
    ...process.env,
    PATH: process.env.PATH, // Explicitly set PATH
    ...env, // Include any additional env vars passed in options
  };

  const child = pty.spawn('sh', ['-c', commandWithArgs], {
    env: envWithPath,
    cwd: options.cwd,
    cols: 80,
    rows: 30,
  });

  void runInputs(inputs, child);

  const promise = new Promise((resolve, reject) => {
    let result = '';
    child.onData((data) => {
      process.stdout.write(data); // Output data immediately
      result += data; // Accumulate data if needed
    });

    child.onExit((exitCode) => {
      if (exitCode.exitCode === 0) {
        resolve(result); // Resolve with the accumulated result
      } else {
        reject(new Error(`Process exited with code ${exitCode.exitCode}\nOutput:\n${result || 'no output'}`));
      }
    });
  }) as Promise<string> & { kill: () => void };

  promise.kill = () => child.kill('SIGKILL');

  return promise;
}

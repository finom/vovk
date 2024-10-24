/* eslint-disable no-console */
/* global NodeJS */
import * as pty from 'node-pty';

// TODO comment
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
    inputs?: string[];
    cwd: string;
  } = {
    cwd: process.cwd(),
  }
) {
  console.info('Running script:', commandWithArgs);
  const { env = process.env, inputs = [] } = options;
  const [command, ...args] = commandWithArgs.split(/\s+/);

  const child = pty.spawn(command, args, {
    env,
    cwd: options.cwd,
    cols: 80,
    rows: 30,
  });

  void runInputs(inputs, child);

  return new Promise((resolve, reject) => {
    let result = '';
    child.onData((data) => {
      process.stdout.write(data); // Output data immediately
      result += data; // Accumulate data if needed
    });

    child.onExit((exitCode) => {
      if (exitCode.exitCode === 0) {
        resolve(result); // Resolve with the accumulated result
      } else {
        reject(new Error(`Process exited with code ${exitCode.exitCode}`));
      }
    });
  });
}

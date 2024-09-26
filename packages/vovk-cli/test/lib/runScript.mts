/* global NodeJS */
import { spawn } from 'child_process';

async function runInputs(inputs: string[], stdin: NodeJS.WritableStream) {
  if (inputs.length > 0) {
    for (const input of inputs) {
      stdin.write(input);

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  stdin.end();
}

export async function runScript(
  commandWithArgs: string,
  options: {
    env?: NodeJS.ProcessEnv;
    timeout?: number;
    inputs?: string[];
    cwd: string;
  } = {
    cwd: process.cwd(),
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new Promise((resolve, reject) => {
    const { env = process.env, timeout = 0, inputs = [] } = options;
    const [command, ...args] = commandWithArgs.split(/\s+/);

    console.log('command, args', command, args);

    const child = spawn(command, args, {
      env,
      cwd: options.cwd,
      stdio: ['pipe', 'inherit', 'inherit'],
    });

    let scriptTimeout: NodeJS.Timeout;
    const { stdin } = child;

    child.on('error', (error) => {
      if (scriptTimeout) clearTimeout(scriptTimeout);
      console.log('ebal rot', error);
      reject(error);
    });

    child.on('close', (code) => {
      if (scriptTimeout) clearTimeout(scriptTimeout);
      resolve({ code });
    });

    void runInputs(inputs, stdin);

    // Set timeout if specified
    if (timeout > 0) {
      scriptTimeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Script timed out after ${timeout} ms`));
      }, timeout);
    }
  });
}

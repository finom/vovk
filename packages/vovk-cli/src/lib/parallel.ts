import { spawn, ChildProcess } from 'child_process';
import { KnownAny, VovkEnv } from '../types';

interface Command {
  command: string;
  name: string;
  env: VovkEnv;
}

/**
 * Execute multiple commands in parallel and return a promise.
 * @param {Command[]} commands - The commands to execute.
 * @returns {Promise<string>}
 */
function parallel(commands: Command[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const children: ChildProcess[] = [];
    const results: Promise<void>[] = [];

    /**
     * Helper function to handle closure of a child process
     * @param {number} index - The index of the child process
     * @param { (value: unknown) => void } resolve - The resolve function of the promise
     * @param { (reason?: any) => void } reject - The reject function of the promise
     * @returns {(code: number | { code: number }) => void}
     */
    function childClose(index: number, resolve: (value: unknown) => void, reject: (reason?: KnownAny) => void) {
      return (code: number | { code: number }) => {
        const exitCode = typeof code === 'object' && 'code' in code ? code.code : code;

        children.forEach((child, i) => {
          setTimeout(() => {
            if (i !== index && child.pid) {
              try {
                process.kill(child.pid, 'SIGKILL');
              } catch (err) {
                if ((err as { code?: string }).code !== 'ESRCH') throw err;
              }
            }
          }, 1000);
        });

        if (exitCode && exitCode > 0) {
          reject(new Error('`' + commands[index].name + '` failed with exit code ' + exitCode));
        } else {
          resolve('`' + commands[index].name + '` ended successfully');
        }
      };
    }

    // Start each command as a child process
    commands.forEach((command, index) => {
      const cmd = command.command;
      const sh = process.platform === 'win32' ? 'cmd' : 'sh';
      const shFlag = process.platform === 'win32' ? '/c' : '-c';

      const child = spawn(sh, [shFlag, cmd], {
        cwd: process.cwd(),
        env: { ...process.env, ...command.env },
        stdio: ['pipe', 'inherit', 'inherit'], // Use 'inherit' to keep stdout and stderr
      });

      children.push(child);

      // Create a new promise for each child process
      const childPromise = new Promise<void>((childResolve, childReject) => {
        child.on('close', childClose(index, childResolve as (value: unknown) => void, childReject));
      });

      results.push(childPromise);
    });

    Promise.all(results)
      .then(() => resolve('All processes have ended successfully'))
      .catch((error) => reject(error));
  });
}

export default parallel;

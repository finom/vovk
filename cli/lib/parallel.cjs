// @ts-check
const { spawn } = require('child_process');

/**
 * Execute multiple commands in parallel and return a promise.
 * @type {(commands: { command: string; name: string; env: import('../../src').VovkEnv }[]) => Promise<string>}
 */
function parallel(commands) {
  return new Promise((resolve, reject) => {
    let children = [];
    let results = [];

    /**
     * Helper function to handle closure of a child process
     * @type {(index: number, resolve: (value: unknown) => void, reject: (reason?: any) => void) => (code: number) => void}
     */
    function childClose(index, resolve, reject) {
      /**
       * @type {(code: number | { code: number }) => void}
       */
      return (code) => {
        code = typeof code === 'object' && 'code' in code ? code.code : code;
        if (code > 0) {
          reject(new Error('`' + commands[index].name + '` failed with exit code ' + code));
        } else {
          resolve('`' + commands[index].name + '` ended successfully');
        }
      };
    }

    // Start each command as a child process
    commands.forEach((command, index) => {
      let cmd = command.command;
      let sh = process.platform === 'win32' ? 'cmd' : 'sh';
      let shFlag = process.platform === 'win32' ? '/c' : '-c';

      let child = spawn(sh, [shFlag, cmd], {
        cwd: process.cwd(),
        env: { ...process.env, ...command.env },
        stdio: ['pipe', 'inherit', 'inherit'], // Use 'inherit' to keep stdout and stderr
      });

      children.push(child);

      // Create a new promise for each child process
      let childPromise = new Promise((childResolve, childReject) => {
        child.on('close', childClose(index, childResolve, childReject));
      });

      results.push(childPromise);
    });

    Promise.all(results)
      .then(() => resolve('All processes have ended successfully'))
      .catch((error) => reject(error));
  });
}

module.exports = parallel;

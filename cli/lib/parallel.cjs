const { spawn } = require('child_process');

/**
 * Execute multiple commands in parallel and return a promise.
 * @param {Array} commands - An array of command objects { command: string, name: string, env: Object }
 * @returns {Promise} - A promise that resolves when all commands have completed.
 * @type {(commands: { command: string; name: string; env: import('../../src').VovkEnv }[]) => Promise<void>}
 */
function parallel(commands) {
  return new Promise((resolve, reject) => {
    let children = [];
    let results = [];

    // Helper function to handle closure of a child process
    function childClose(index, resolve, reject) {
      return (code) => {
        code = code ? code.code || code : code;
        if (code > 0) {
          reject(new Error('`' + commands[index].name + '` failed with exit code ' + code));
        } else {
          resolve('`' + commands[index].name + '` ended successfully');
        }
      };
    }

    // Start each command as a child process
    commands.forEach((command, index) => {
      let cmd = process.platform !== 'win32' ? 'exec ' + command.command : command.command;
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

    // Use Promise.all to wait for all child processes to complete
    Promise.all(results)
      .then(() => resolve('All processes have ended successfully'))
      .catch((error) => reject(error));
  });
}

module.exports = parallel;

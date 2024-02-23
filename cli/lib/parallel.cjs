// @ts-check
const { spawn } = require('child_process');

/** @type {(commands: { command: string; name: string; env: import('../../src').VovkEnv }[]) => Promise<void>} */
function parallel(commands) {
  return new Promise((resolve, reject) => {
    /** @type {{ name: string; process: import('child_process').ChildProcess; }[]} */
    let processes = [];

    commands.forEach((cmd) => {
      const processObj = {
        name: cmd.name,
        process: runCommand(
          cmd.command,
          cmd.env,
          /** @type {(code: number) => void} */
          (code) => handleProcessExit(code, cmd.name)
        ),
      };
      processes.push(processObj);
    });

    /** @type {(command: string, env: import('../../src').VovkEnv, onExit: (code: number) => void) => import('child_process').ChildProcess} */
    function runCommand(command, env, onExit) {
      const proc = spawn(command, { shell: true, env: { ...env, ...process.env }, stdio: 'inherit' });

      proc.on('exit', onExit);

      return proc;
    }

    /** @type {(code: number, name: string) => void} */
    function handleProcessExit(code, name) {
      processes = processes.filter((p) => p.name !== name);

      if (code !== 0) {
        processes.forEach((p) => p.name !== name && p.process.kill('SIGTERM'));
        processes = [];
        process.stdout.write('\n');
        return reject(new Error(`Process ${name} exited with code ${code}`));
      }

      if (!processes.length) {
        resolve();
      }
    }
  });
}

module.exports = parallel;

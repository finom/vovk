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
      const proc = spawn(command, { shell: true, detached: true, env: { ...env, ...process.env }, stdio: 'inherit' });

      proc.on('exit', onExit);

      return proc;
    }

    /** @type {(code: number, name: string) => void} */
    function handleProcessExit(code, name) {
      processes = processes.filter((p) => p.name !== name);

      processes.forEach((p) => {
        if (p.name !== name) {
          // TS fix
          if (p.process.pid) {
            process.kill(-p.process.pid, 'SIGTERM');
          }
        }
      });
      processes = [];
      process.stdout.write('\n');
      if (code !== 0) {
        return reject(new Error(`Process ${name} exited with code ${code}`));
      }
    }
  });
}

module.exports = parallel;

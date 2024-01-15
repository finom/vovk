// @ts-check
const { spawn } = require('child_process');

/** @type {(commands: { command: string; name: string; }[]) => Promise<void>} */
function concurrent(commands) {
  return new Promise((resolve, reject) => {
    let processes = [];

    commands.forEach((cmd) => {
      const processObj = {
        name: cmd.name,
        process: runCommand(cmd.command, cmd.name, (code) => handleProcessExit(code, cmd.name, resolve, reject)),
      };
      processes.push(processObj);
    });

    function runCommand(command, name, onExit) {
      const proc = spawn(command, { shell: true, env: process.env, stdio: ['inherit', 'pipe', 'pipe'] });

      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);

      proc.on('exit', onExit);

      return proc;
    }

    function handleProcessExit(code, name, resolve, reject) {
      if (!processes.length) {
        // resolved or rejected already
        return;
      }

      processes.forEach((p) => p.name !== name && p.process.kill());

      processes = [];

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    }
  });
}

module.exports = concurrent;

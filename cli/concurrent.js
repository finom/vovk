// @ts-check
const { spawn } = require('child_process');

/** @type {(commands: { command: string; name: string; }[]) => Promise<void>} */
function concurrent(commands) {
  return new Promise((resolve, reject) => {
    let processes = [];

    commands.forEach((cmd) => {
      const processObj = {
        name: cmd.name,
        process: runCommand(cmd.command, cmd.name, (code) => handleProcessExit(code, resolve, reject)),
      };
      processes.push(processObj);
    });

    function runCommand(command, name, onExit) {
      const parts = command.split(' ');
      const mainCommand = parts.shift();
      const args = parts;

      const proc = spawn(mainCommand, args, { shell: true, env: process.env, stdio: 'inherit' });

      proc.on('exit', onExit);

      return proc;
    }

    function handleProcessExit(code, resolve, reject) {
      if (!processes.length) {
        return;
      }
      processes.forEach((p) => p.process.kill());

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

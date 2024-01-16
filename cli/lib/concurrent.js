// @ts-check
const { spawn } = require('child_process');

/** @type {(commands: { command: string; name: string; }[]) => Promise<void>} */
function concurrent(commands) {
  return new Promise((resolve, reject) => {
    /** @type {{ name: string; process: import('child_process').ChildProcess; }[]} */
    let processes = [];

    commands.forEach((cmd) => {
      const processObj = {
        name: cmd.name,
        process: runCommand(cmd.command, cmd.name, (code) => handleProcessExit(code, cmd.name)),
      };
      processes.push(processObj);
    });

    function runCommand(command, name, onExit) {
      const proc = spawn(command, { shell: true, env: process.env, stdio: 'inherit' });

      proc.on('exit', onExit);

      return proc;
    }

    function handleProcessExit(code, name) {
      processes = processes.filter((p) => p.name !== name);

      if (code !== 0) {
        processes.forEach((p) => p.name !== name && p.process.kill());
        processes = [];
        return reject(new Error(`Process ${name} exited with code ${code}`));
      }

      if (!processes.length) {
        resolve();
      }
    }
  });
}

module.exports = concurrent;

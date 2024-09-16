import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execPromise = promisify(exec);

export default async function installDependencies(
  installDir: string,
  dependencies: string[],
  devDependencies: string[]
): Promise<void> {
  const absolutePath = path.resolve(installDir);

  try {
    if (dependencies.length > 0) {
      console.log(`Installing dependencies in ${absolutePath}...`);
      const { stdout, stderr } = await execPromise(`npm install ${dependencies.join(' ')} --prefix ${absolutePath}`);
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
    }

    if (devDependencies.length > 0) {
      console.log(`Installing dev dependencies in ${absolutePath}...`);
      const { stdout, stderr } = await execPromise(
        `npm install --save-dev ${devDependencies.join(' ')} --prefix ${absolutePath}`
      );
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
    }
  } catch (err) {
    console.error(`Error installing dependencies: ${(err as Error).message}`);
  }
}

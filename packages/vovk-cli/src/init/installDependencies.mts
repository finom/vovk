import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execPromise = promisify(exec);

export default async function installDependencies(
  installDir: string,
  dependencies: string[],
  devDependencies: string[]
): Promise<void> {
  const fullPath = path.resolve(installDir);

  try {
    if (dependencies.length > 0) {
      console.log(`Installing dependencies in ${fullPath}...`);
      const { stdout, stderr } = await execPromise(`npm install ${dependencies.join(' ')} --prefix ${fullPath}`);
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
    }

    if (devDependencies.length > 0) {
      console.log(`Installing dev dependencies in ${fullPath}...`);
      const { stdout, stderr } = await execPromise(
        `npm install --save-dev ${devDependencies.join(' ')} --prefix ${fullPath}`
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

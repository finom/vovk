import path from 'path';
import directoryExists from './directoryExists';

export default async function getSrcRoot() {
  const cwd = process.cwd();
  // Next.js Docs: src/app or src/pages will be ignored if app or pages are present in the root directory.
  if (await directoryExists(path.join(cwd, 'app'))) {
    return cwd;
  } else if (await directoryExists(path.join(cwd, 'src/app'))) {
    return path.join(cwd, 'src');
  }

  throw new Error(`Could not find app router directory. Check Next.js docs for more info.`);
}

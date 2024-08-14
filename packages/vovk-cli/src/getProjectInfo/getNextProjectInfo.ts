import path from 'path';
import directoryExists from './directoryExists';

export default async function getNextProjectInfo() {
  const cwd = process.cwd();
  // Next.js Docs: src/app or src/pages will be ignored if app or pages are present in the root directory.
  const dirs = [path.join(cwd, 'app'), path.join(cwd, 'pages')];
  const isRootDir = (await Promise.all(dirs.map(directoryExists))).some((dir) => dir);

  return {
    projectRoot: isRootDir ? cwd : path.join(cwd, 'src'),
  };
}

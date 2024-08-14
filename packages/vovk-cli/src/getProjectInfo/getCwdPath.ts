import path from 'path';

export default function getCwdPath<T extends string | null>(inputPath: T, baseDir = process.cwd()): T {
  if (inputPath === null) {
    return null as T;
  }
  // Check if the path is absolute
  if (path.isAbsolute(inputPath) || inputPath.startsWith('./') || inputPath.startsWith('../')) {
    return path.resolve(baseDir, inputPath) as T;
  }

  // If it's a module or absolute path, keep it as is
  return inputPath;
}

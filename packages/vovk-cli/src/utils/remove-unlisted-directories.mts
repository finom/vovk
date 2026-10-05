import fs from 'node:fs/promises';
import path from 'node:path';
import { hasGeneratedBanner } from './generated-banner.mjs';
import { FileSystemEntryType, getFileSystemEntryType } from './get-file-system-entry-type.mjs';

type PruneContext = {
  basePath: string;
  allowedDirs: string[];
  generated?: { relPaths: string[]; unstampedRelPaths: string[] };
  excludedDirs: string[];
  skipped: string[];
};

// removes all dirs in folderPath that aren't in allowedDirs, supports nested paths like 'foo/bar/baz'
// generatedRelPaths guards user files: a dir holding anything the generator wouldn't write is kept,
// returns the dirs that were kept for that reason
export async function removeUnlistedDirectories(
  folderPath: string,
  allowedDirs: string[],
  generatedRelPaths?: string[],
  {
    unstampedRelPaths = [],
    excludedDirs = [],
  }: {
    // generated files besides JSON that carry no banner, such as the files a template copies as they are
    unstampedRelPaths?: string[];
    // absolute paths of directories to leave alone, such as the output directory of another client
    excludedDirs?: string[];
  } = {}
): Promise<string[]> {
  const context: PruneContext = {
    basePath: folderPath,
    // Normalize all allowed paths to use the system-specific separator
    allowedDirs: allowedDirs.map((dir) => dir.split('/').join(path.sep)),
    generated: generatedRelPaths && { relPaths: generatedRelPaths, unstampedRelPaths },
    excludedDirs: excludedDirs.map((dir) => path.resolve(dir)),
    skipped: [],
  };

  // Process the directory tree recursively
  await processDirectory(context, '');

  return context.skipped;
}

// the directories, relative to the scanned one, that hold relPath as a segment's generated file.
// a nested segment such as bar/baz adds leading directories, "[package_name]" is substituted at write time
function getSegmentDirs(relPath: string, generatedRelPaths: string[]): string[] {
  const segments = relPath.split(path.sep);

  return generatedRelPaths.flatMap((generated) => {
    const generatedSegments = generated.split(path.sep);
    const offset = segments.length - generatedSegments.length;
    const isMatch =
      offset >= 0 &&
      generatedSegments.every((segment, i) => segment === '[package_name]' || segment === segments[offset + i]);

    return isMatch ? [segments.slice(0, offset).join(path.sep)] : [];
  });
}

async function isGeneratedFile(absolutePath: string): Promise<boolean> {
  try {
    return hasGeneratedBanner(await fs.readFile(absolutePath, 'utf-8'));
  } catch {
    return false;
  }
}

async function listFiles(dirPath: string, relativePath = ''): Promise<{ files: string[]; hasEmptyDir: boolean }> {
  // a directory removed meanwhile lists as empty
  const entries = await fs.readdir(path.join(dirPath, relativePath), { withFileTypes: true }).catch(() => []);
  const result = { files: [] as string[], hasEmptyDir: !entries.length };

  for (const entry of entries) {
    const entryRelPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      const nested = await listFiles(dirPath, entryRelPath);
      result.files.push(...nested.files);
      result.hasEmptyDir ||= nested.hasEmptyDir;
    } else {
      result.files.push(entryRelPath);
    }
  }

  return result;
}

// "generated" only when the generator wrote every file below dirPath, a matching name alone is not enough
export async function getDirectoryOrigin(
  dirPath: string,
  generatedRelPaths: string[],
  unstampedRelPaths: string[] = []
): Promise<'generated' | 'foreign' | 'empty'> {
  const { files, hasEmptyDir } = await listFiles(dirPath);
  if (!files.length) return 'empty';
  // the generator never leaves an empty directory behind
  if (hasEmptyDir) return 'foreign';

  const bannerSegmentDirs = new Set<string>();
  const unstampedSegmentDirs: string[][] = [];

  for (const file of files) {
    const segmentDirs = getSegmentDirs(file, generatedRelPaths);
    if (!segmentDirs.length) return 'foreign';

    const unstampedDirs = path.extname(file) === '.json' ? segmentDirs : getSegmentDirs(file, unstampedRelPaths);
    if (unstampedDirs.length) {
      unstampedSegmentDirs.push(unstampedDirs);
    } else if (await isGeneratedFile(path.join(dirPath, file))) {
      for (const segmentDir of segmentDirs) bannerSegmentDirs.add(segmentDir);
    } else {
      return 'foreign';
    }
  }

  // json and copied files hold no banner, they count only beside a bannered file of the same segment directory
  return unstampedSegmentDirs.every((segmentDirs) =>
    segmentDirs.some((segmentDir) => bannerSegmentDirs.has(segmentDir))
  )
    ? 'generated'
    : 'foreign';
}

// a folder inside a kept segment directory that holds only that segment's generated files, such as a Rust client's src/
async function isSegmentContent({ basePath, allowedDirs, generated }: PruneContext, relativePath: string) {
  const segmentDir = allowedDirs
    .filter((dir) => relativePath.startsWith(dir + path.sep))
    .sort((a, b) => b.length - a.length)[0];
  if (!segmentDir || !generated) return false;

  const { files } = await listFiles(path.join(basePath, relativePath));
  const dirInSegment = path.relative(segmentDir, relativePath);

  return (
    files.length > 0 &&
    files.every((file) => getSegmentDirs(path.join(dirInSegment, file), generated.relPaths).includes(''))
  );
}

// a folder kept only for a segment inside it, such as admin/ for admin/users, still holds the files of its own segment
// once that segment is gone; they go, along with the folders they leave empty, and anything else stays
async function removeOwnGeneratedFiles(
  { basePath, allowedDirs, generated, excludedDirs }: PruneContext,
  relativePath: string
) {
  if (!generated) return;
  const dirPath = path.join(basePath, relativePath);
  const { files } = await listFiles(dirPath);
  const stampedFiles: string[] = [];
  const unstampedFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const isElsewhere =
      allowedDirs.some((dir) => path.join(relativePath, file).startsWith(dir + path.sep)) ||
      excludedDirs.some((dir) => fullPath.startsWith(dir + path.sep));
    if (isElsewhere || !getSegmentDirs(file, generated.relPaths).includes('')) continue;

    if (path.extname(file) === '.json' || getSegmentDirs(file, generated.unstampedRelPaths).includes('')) {
      unstampedFiles.push(file);
    } else if (await isGeneratedFile(fullPath)) {
      stampedFiles.push(file);
    }
  }

  // json and copied files count only beside a bannered file
  const generatedFiles = stampedFiles.length ? [...stampedFiles, ...unstampedFiles] : [];
  const dirs = new Set<string>();
  for (const file of generatedFiles) {
    await fs.rm(path.join(dirPath, file), { force: true });
    for (let dir = path.dirname(file); dir !== '.'; dir = path.dirname(dir)) dirs.add(dir);
  }
  for (const dir of [...dirs].sort((a, b) => b.length - a.length)) {
    await fs.rmdir(path.join(dirPath, dir)).catch(() => {
      // holds something else
    });
  }
}

// a case-insensitive file system keeps the old folder name when a segment is renamed in letter case only,
// so a folder that is the same one as an allowed path stands for it
async function findAllowedAlias({ basePath, allowedDirs }: PruneContext, relativePath: string) {
  const depth = relativePath.split(path.sep).length;
  const fold = (dir: string) => dir.normalize('NFC').toLowerCase();
  const candidates = new Set(
    allowedDirs
      .map((dir) => dir.split(path.sep).slice(0, depth).join(path.sep))
      .filter((dir) => dir !== relativePath && fold(dir) === fold(relativePath))
  );
  const stat = (dir: string) => fs.stat(path.join(basePath, dir)).catch(() => null);
  const dirStats = await stat(relativePath);

  for (const candidate of candidates) {
    const candidateStats = await stat(candidate);
    if (dirStats && candidateStats?.ino === dirStats.ino && candidateStats.dev === dirStats.dev) return candidate;
  }

  return null;
}

// recursively decides which dirs to keep or remove
async function processDirectory(context: PruneContext, relativePath: string): Promise<void> {
  const { basePath, allowedDirs, generated, excludedDirs, skipped } = context;
  const currentDirPath = path.join(basePath, relativePath);

  // check if the current path is a directory
  const type = await getFileSystemEntryType(currentDirPath);
  if (type !== FileSystemEntryType.DIRECTORY) {
    // If it's not a directory, return early
    return;
  }

  if (relativePath && !allowedDirs.includes(relativePath)) await removeOwnGeneratedFiles(context, relativePath);

  // Read all entries in the current directory
  const entries = await fs.readdir(currentDirPath, { withFileTypes: true }).catch(() => []);

  // Process only directories
  const dirEntries = entries.filter((entry) => entry.isDirectory());

  // Check if this directory or any of its subdirectories should be kept
  const isAllowed = (dir: string) =>
    allowedDirs.some((allowedDir) => {
      // Direct match
      if (allowedDir === dir) return true;

      // Check if it's a parent path of an allowed directory
      // e.g. "foo" is a parent of "foo/bar/baz"
      return allowedDir.startsWith(dir + path.sep);
    });

  // Check each directory
  for (const dir of dirEntries) {
    // Calculate the new relative path
    let newRelativePath = relativePath ? path.join(relativePath, dir.name) : dir.name;

    if (!isAllowed(newRelativePath))
      newRelativePath = (await findAllowedAlias(context, newRelativePath)) ?? newRelativePath;

    if (isAllowed(newRelativePath)) {
      // Recursively process this directory's contents
      await processDirectory(context, newRelativePath);
    } else {
      const fullPath = path.join(basePath, newRelativePath);

      // another client's output directory, or one holding it
      if (excludedDirs.some((excludedDir) => excludedDir === fullPath || excludedDir.startsWith(fullPath + path.sep))) {
        continue;
      }

      if (generated) {
        if (await isSegmentContent(context, newRelativePath)) continue;

        const origin = await getDirectoryOrigin(fullPath, generated.relPaths, generated.unstampedRelPaths);
        // an empty directory is left alone silently, one holding anything else is reported
        if (origin === 'foreign') skipped.push(fullPath);
        if (origin !== 'generated') continue;
      }

      // Remove this directory since it's not in the allowed list
      await fs.rm(fullPath, { recursive: true, force: true });
    }
  }
}

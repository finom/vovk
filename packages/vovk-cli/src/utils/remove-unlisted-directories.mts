import fs from 'node:fs/promises';
import path from 'node:path';
import { GENERATED_BANNER_PREFIX } from './generated-banner.mjs';
import { FileSystemEntryType, getFileSystemEntryType } from './get-file-system-entry-type.mjs';

// removes all dirs in folderPath that aren't in allowedDirs, supports nested paths like 'foo/bar/baz'
// generatedRelPaths guards user files: a dir holding anything the generator wouldn't write is kept,
// returns the dirs that were kept for that reason
export async function removeUnlistedDirectories(
  folderPath: string,
  allowedDirs: string[],
  generatedRelPaths?: string[]
): Promise<string[]> {
  // Normalize all allowed paths to use the system-specific separator
  const normalizedAllowedDirs = allowedDirs.map((dir) => dir.split('/').join(path.sep));
  const skipped: string[] = [];

  // Process the directory tree recursively
  await processDirectory(folderPath, '', normalizedAllowedDirs, generatedRelPaths, skipped);

  return skipped;
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

async function hasGeneratedBanner(absolutePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content.slice(0, content.indexOf('\n') + 1 || undefined).includes(GENERATED_BANNER_PREFIX);
  } catch {
    return false;
  }
}

async function listFiles(dirPath: string, relativePath = ''): Promise<{ files: string[]; hasEmptyDir: boolean }> {
  const entries = await fs.readdir(path.join(dirPath, relativePath), { withFileTypes: true });
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
async function getDirectoryOrigin(
  dirPath: string,
  generatedRelPaths: string[]
): Promise<'generated' | 'foreign' | 'empty'> {
  const { files, hasEmptyDir } = await listFiles(dirPath);
  if (!files.length) return 'empty';
  // the generator never leaves an empty directory behind
  if (hasEmptyDir) return 'foreign';

  const bannerSegmentDirs = new Set<string>();
  const jsonSegmentDirs: string[][] = [];

  for (const file of files) {
    const segmentDirs = getSegmentDirs(file, generatedRelPaths);
    if (!segmentDirs.length) return 'foreign';

    if (path.extname(file) === '.json') {
      jsonSegmentDirs.push(segmentDirs);
    } else if (await hasGeneratedBanner(path.join(dirPath, file))) {
      for (const segmentDir of segmentDirs) bannerSegmentDirs.add(segmentDir);
    } else {
      return 'foreign';
    }
  }

  // json holds no banner, so it counts only beside a bannered file of the same segment directory
  return jsonSegmentDirs.every((segmentDirs) => segmentDirs.some((segmentDir) => bannerSegmentDirs.has(segmentDir)))
    ? 'generated'
    : 'foreign';
}

// recursively decides which dirs to keep or remove
async function processDirectory(
  basePath: string,
  relativePath: string,
  allowedDirs: string[],
  generatedRelPaths: string[] | undefined,
  skipped: string[]
): Promise<void> {
  const currentDirPath = path.join(basePath, relativePath);

  // check if the current path is a directory
  const type = await getFileSystemEntryType(currentDirPath);
  if (type !== FileSystemEntryType.DIRECTORY) {
    // If it's not a directory, return early
    return;
  }

  // Read all entries in the current directory
  const entries = await fs.readdir(currentDirPath, { withFileTypes: true });

  // Process only directories
  const dirEntries = entries.filter((entry) => entry.isDirectory());

  // Check each directory
  for (const dir of dirEntries) {
    // Calculate the new relative path
    const newRelativePath = relativePath ? path.join(relativePath, dir.name) : dir.name;

    // Check if this directory or any of its subdirectories should be kept
    const shouldKeep = allowedDirs.some((allowedDir) => {
      // Direct match
      if (allowedDir === newRelativePath) return true;

      // Check if it's a parent path of an allowed directory
      // e.g. "foo" is a parent of "foo/bar/baz"
      return allowedDir.startsWith(newRelativePath + path.sep);
    });

    if (shouldKeep) {
      // Recursively process this directory's contents
      await processDirectory(basePath, newRelativePath, allowedDirs, generatedRelPaths, skipped);
    } else {
      const fullPath = path.join(basePath, newRelativePath);

      if (generatedRelPaths) {
        const origin = await getDirectoryOrigin(fullPath, generatedRelPaths);
        // an empty directory is left alone silently, one holding anything else is reported
        if (origin === 'foreign') skipped.push(fullPath);
        if (origin !== 'generated') continue;
      }

      // Remove this directory since it's not in the allowed list
      await fs.rm(fullPath, { recursive: true, force: true });
    }
  }
}

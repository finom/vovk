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

// "[package_name]" is substituted at write time, so treat it as a wildcard segment
function matchesGeneratedPath(relPath: string, generatedRelPaths: string[]): boolean {
  const segments = relPath.split(path.sep);

  return generatedRelPaths.some((generated) => {
    const generatedSegments = generated.split(path.sep);
    if (generatedSegments.length > segments.length) return false;
    // a nested segment such as bar/baz adds leading directories, so match the tail
    const offset = segments.length - generatedSegments.length;
    return generatedSegments.every((segment, i) => segment === '[package_name]' || segment === segments[offset + i]);
  });
}

// a matching name is not enough, a user file may be named like ours, so require our banner too.
// json holds no comment and therefore no banner, so there the name stays the only signal
async function isGeneratedFile(absolutePath: string, relPath: string, generatedRelPaths: string[]): Promise<boolean> {
  if (!matchesGeneratedPath(relPath, generatedRelPaths)) return false;
  if (path.extname(absolutePath) === '.json') return true;

  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content.slice(0, content.indexOf('\n') + 1 || undefined).includes(GENERATED_BANNER_PREFIX);
  } catch {
    return false;
  }
}

// true when every file below dirPath is something the generator wrote
async function containsOnlyGenerated(
  dirPath: string,
  generatedRelPaths: string[],
  relativePath = ''
): Promise<boolean> {
  const entries = await fs.readdir(path.join(dirPath, relativePath), { withFileTypes: true });

  for (const entry of entries) {
    const entryRelPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      if (!(await containsOnlyGenerated(dirPath, generatedRelPaths, entryRelPath))) return false;
    } else if (!(await isGeneratedFile(path.join(dirPath, entryRelPath), entryRelPath, generatedRelPaths))) {
      return false;
    }
  }

  return true;
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

      // never delete a directory that holds files we did not generate
      if (generatedRelPaths && !(await containsOnlyGenerated(fullPath, generatedRelPaths))) {
        skipped.push(fullPath);
        continue;
      }

      // Remove this directory since it's not in the allowed list
      await fs.rm(fullPath, { recursive: true, force: true });
    }
  }
}

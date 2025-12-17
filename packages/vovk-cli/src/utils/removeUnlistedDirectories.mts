import fs from 'fs/promises';
import path from 'path';
import { getFileSystemEntryType, FileSystemEntryType } from './getFileSystemEntryType.mjs';

/**
 * Removes all directories in a folder that aren't in the provided allowlist
 * Supports nested directory paths like 'foo/bar/baz'
 *
 * @param folderPath - The path to the folder to process
 * @param allowedDirs - Array of relative directory paths to keep
 * @returns Promise that resolves when all operations are complete
 */
export async function removeUnlistedDirectories(folderPath: string, allowedDirs: string[]): Promise<void> {
  // Normalize all allowed paths to use the system-specific separator
  const normalizedAllowedDirs = allowedDirs.map((dir) => dir.split('/').join(path.sep));

  // Process the directory tree recursively
  await processDirectory(folderPath, '', normalizedAllowedDirs);
}

/**
 * Recursively processes directories to determine which should be kept or removed
 *
 * @param basePath - The absolute base path being processed
 * @param relativePath - The current relative path from the base
 * @param allowedDirs - Normalized list of allowed directory paths
 */
async function processDirectory(basePath: string, relativePath: string, allowedDirs: string[]): Promise<void> {
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
      await processDirectory(basePath, newRelativePath, allowedDirs);
    } else {
      // Remove this directory since it's not in the allowed list
      const fullPath = path.join(basePath, newRelativePath);
      await fs.rm(fullPath, { recursive: true, force: true });
    }
  }
}

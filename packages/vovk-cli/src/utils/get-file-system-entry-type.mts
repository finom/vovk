import fs from 'node:fs/promises';

// const object instead of enum, node 26 runs ts with erasable syntax only
export const FileSystemEntryType = {
  FILE: 'FILE',
  DIRECTORY: 'DIRECTORY',
} as const;
export type FileSystemEntryType = (typeof FileSystemEntryType)[keyof typeof FileSystemEntryType];

export async function getFileSystemEntryType(filePath: string): Promise<FileSystemEntryType | null> {
  try {
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      return FileSystemEntryType.FILE;
    } else if (stats.isDirectory()) {
      return FileSystemEntryType.DIRECTORY;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

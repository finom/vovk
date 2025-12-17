import fs from 'node:fs/promises';

export enum FileSystemEntryType {
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY',
}

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

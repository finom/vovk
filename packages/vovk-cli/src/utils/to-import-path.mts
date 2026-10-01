import path from 'node:path';

// a JS string literal treats "\" as an escape, so a Windows path must not reach generated code as is
export function toPosixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

// a relative path without "./" would be read as a package name
export function toImportPath(relativePath: string): string {
  const posixPath = toPosixPath(relativePath);
  return /^\.\.?(\/|$)/.test(posixPath) || path.isAbsolute(posixPath) ? posixPath : `./${posixPath}`;
}

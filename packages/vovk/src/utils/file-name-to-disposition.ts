export function fileNameToDisposition(filename: string): string {
  return `attachment; filename="${filename.replace(/[^\x20-\x7E]|"/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

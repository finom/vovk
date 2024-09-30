import { createGunzip, Gunzip } from 'zlib';
import tar, { Headers } from 'tar-stream';
import { Readable } from 'stream';

/**
 * Retrieves a list of files in the 'templates' folder of an NPM package.
 * @param packageName - The name of the NPM package.
 * @returns A promise that resolves to an array of file paths.
 */
export default async function getTemplatesFiles(
  packageName: string,
  channel = 'beta' // TODO change to latest
): Promise<Record<string, string>> {
  // Fetch package metadata from the npm registry
  const metadataResponse = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);
  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch package metadata: ${metadataResponse.statusText}`);
  }

  const metadata = (await metadataResponse.json()) as NpmPackageMetadata;
  const latestVersion = metadata['dist-tags'][channel];
  const tarballUrl = metadata.versions[latestVersion].dist.tarball;

  // Fetch the tarball
  const tarballResponse = await fetch(tarballUrl);
  if (!tarballResponse.ok) {
    throw new Error(`Failed to fetch tarball: ${tarballResponse.statusText}`);
  }

  const tarballArrayBuffer = await tarballResponse.arrayBuffer();
  const tarballBuffer = Buffer.from(tarballArrayBuffer);

  // Extract the tarball in memory and collect template files
  const templateFiles = await extractTemplatesFromTarball(tarballBuffer);

  const entries = templateFiles
    .filter((fileName) => fileName.startsWith('templates/') && !fileName.endsWith('/') && fileName.endsWith('.ejs'))
    .map((fileName) => [fileName.substring('templates/'.length).replace(/\.ejs$/, ''), `${packageName}/${fileName}`]);

  console.log(templateFiles);
  return Object.fromEntries(entries) as Record<string, string>;
}

/**
 * Extracts the templates from the tarball buffer.
 * @param tarballBuffer - The tarball data as a Buffer.
 * @returns A promise that resolves to an array of template file paths.
 */
function extractTemplatesFromTarball(tarballBuffer: Buffer): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const extract = tar.extract();
    const files: string[] = [];

    extract.on('entry', (header: Headers, stream: Readable, next: () => void) => {
      const filePath = header.name;
      console.log('filePath', filePath);
      // Check if the file is in the 'templates' folder
      if (filePath.startsWith('package/templates/')) {
        files.push(filePath.replace('package/', ''));
      }
      stream.on('end', () => next());
      stream.resume();
    });

    extract.on('finish', () => {
      resolve(files);
    });

    extract.on('error', (err: Error) => {
      reject(err);
    });

    // Decompress and extract the tarball buffer
    const gunzip: Gunzip = createGunzip();
    gunzip.on('error', reject);

    const tarballStream = Readable.from(tarballBuffer);
    tarballStream.pipe(gunzip).pipe(extract);
  });
}

/**
 * Interface representing the structure of NPM package metadata.
 */
interface NpmPackageMetadata {
  'dist-tags': {
    [tag: string]: string;
  };
  versions: {
    [version: string]: NpmPackageVersion;
  };
}

/**
 * Interface representing a specific version of an NPM package.
 */
interface NpmPackageVersion {
  dist: {
    tarball: string;
  };
}

/**
 * Interface representing the structure of NPM package metadata.
 */
interface NpmPackageMetadata {
  'dist-tags': {
    [tag: string]: string;
  };
  versions: {
    [version: string]: {
      dist: {
        tarball: string;
      };
    };
  };
}

export default async function getNPMPackageMetadata(packageName: string): Promise<NpmPackageMetadata> {
  // Fetch package metadata from the npm registry
  const metadataResponse = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);
  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch package metadata: ${metadataResponse.statusText}`);
  }

  const metadata = (await metadataResponse.json()) as NpmPackageMetadata;

  return metadata;
}

/**
 * Interface representing the structure of NPM package metadata.
 */
export interface NpmPackageMetadata {
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

export async function getNPMPackageMetadata(packageName: string): Promise<NpmPackageMetadata> {
  // npm and npx hand the registry from .npmrc to the process they start
  const registry = (process.env.npm_config_registry || 'https://registry.npmjs.org').replace(/\/?$/, '/');
  const fail = (reason: string) =>
    new Error(`Failed to fetch metadata for package ${packageName} from ${registry}: ${reason}`);
  const metadataResponse = await fetch(`${registry}${encodeURIComponent(packageName)}`).catch((error: Error) => {
    throw fail((error.cause as Error | undefined)?.message ?? error.message);
  });
  if (!metadataResponse.ok) {
    throw fail(`${metadataResponse.status} ${metadataResponse.statusText}`);
  }

  const metadata = (await metadataResponse.json()) as NpmPackageMetadata;

  return metadata;
}

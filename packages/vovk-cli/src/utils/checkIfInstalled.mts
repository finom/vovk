import { createRequire } from 'node:module';

/**
 * Checks if a package is installed and available to be imported
 * @param packageName The name of the package to check
 * @returns A boolean indicating if the package is installed
 */
export async function checkIfInstalled(packageName: string): Promise<boolean> {
  try {
    // Create a require function that works in ESM
    const require = createRequire(import.meta.url);
    require.resolve(packageName);
    return true;
  } catch {
    // If an error is thrown, the package is not installed or cannot be resolved
    return false;
  }
}

/**
 * Synchronous version of checkIfInstalled
 * @param packageName The name of the package to check
 * @returns A boolean indicating if the package is installed
 */
export function checkIfInstalledSync(packageName: string): boolean {
  try {
    const require = createRequire(import.meta.url);
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

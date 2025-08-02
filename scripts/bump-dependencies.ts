/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

interface PackageJson {
  name: string;
  version: string;
  dependencies?: {
    [key: string]: string;
  };
  devDependencies?: {
    [key: string]: string;
  };
  peerDependencies?: {
    [key: string]: string;
  };
  optionalDependencies?: {
    [key: string]: string;
  };
}

const cwd = process.cwd();

/**
 * Updates dependency versions in all packages that depend on the specified package.
 * @param packageName - The name of the package to update.
 * @param newVersion - The new version to set for the package.
 */
function updateDependencyVersions(packageName: string, newVersion: string): string[] {
  const packagesDir = path.join(cwd, 'packages');
  const packages = fs.readdirSync(packagesDir);
  const updatedPackages: string[] = [];

  packages.forEach((pkg) => {
    const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');

    if (fs.existsSync(pkgJsonPath)) {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')) as PackageJson;

      let updated = false;
      const versionValue = `^${newVersion}`;

      if (pkgJson.dependencies?.[packageName] && pkgJson.dependencies[packageName] !== versionValue) {
        pkgJson.dependencies[packageName] = versionValue;
        updated = true;
      }

      if (pkgJson.devDependencies?.[packageName] && pkgJson.devDependencies[packageName] !== versionValue) {
        pkgJson.devDependencies[packageName] = versionValue;
        updated = true;
      }

      if (pkgJson.peerDependencies?.[packageName] && pkgJson.peerDependencies[packageName] !== versionValue) {
        pkgJson.peerDependencies[packageName] = versionValue;
        updated = true;
      }

      if (pkgJson.optionalDependencies?.[packageName] && pkgJson.optionalDependencies[packageName] !== versionValue) {
        pkgJson.optionalDependencies[packageName] = versionValue;
        updated = true;
      }

      if (updated) {
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
        console.log(`Updated ${packageName} to version ${newVersion} in ${pkg}`);
        updatedPackages.push(pkg);
      }
    }
  });

  return updatedPackages;
}

const packageNameToBump = process.env.PACKAGE;

if (!packageNameToBump) {
  console.error('Error: PACKAGE environment variable is required.');
  process.exit(1);
}

const packagesDir = path.join(cwd, 'packages');
const packageJsonPath = path.join(packagesDir, packageNameToBump, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: package.json not found for package "${packageNameToBump}".`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
const newVersion = packageJson.version;

if (!newVersion) {
  console.error(`Error: Could not find version in package.json for package "${packageNameToBump}".`);
  process.exit(1);
}

const updatedPackages = updateDependencyVersions(packageNameToBump, newVersion);

if (updatedPackages.length > 0) {
  updatedPackages.forEach((pkg) => {
    console.log(`Cleaning and reinstalling dependencies for ${pkg}...`);

    const packagePath = path.join(packagesDir, pkg);

    fs.rmSync(path.join(packagePath, 'node_modules'), { recursive: true, force: true });
    fs.rmSync(path.join(packagePath, 'package-lock.json'), { force: true });

    execSync('npm install', { cwd: packagePath, stdio: 'inherit' });
  });
}

console.log(`Dependency versions updated for package: ${packageNameToBump}`);

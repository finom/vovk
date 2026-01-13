import { describe, it } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import type { PackageJson } from 'type-fest';
import { resolveGeneratorConfigValues, type VovkOutputConfig, type VovkStrictConfig } from 'vovk/internal';

describe('resolveGeneratorConfigValues', () => {
  describe('Basic Configuration Resolution', () => {
    it('should handle minimal schema with only required fields', () => {
      const result = resolveGeneratorConfigValues({
        config: undefined,
        outputConfigs: [],
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
      });

      deepStrictEqual(result.package, {});
      strictEqual(result.origin, '');
      deepStrictEqual(result.imports, {
        fetcher: 'vovk/fetcher',
        validateOnClient: null,
        createRPC: 'vovk/createRPC',
      });
      deepStrictEqual(result.reExports, {});
      deepStrictEqual(result.readme, {});
      deepStrictEqual(result.samples, {});
    });

    it('should handle empty string segmentName (root segment)', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            segments: {
              '': {
                package: { version: '1.0.0' },
              },
            },
          },
        },
        outputConfigs: [{ package: { name: 'root-segment' } }],
        segmentName: '',
        isBundle: false,
        projectPackageJson: undefined,
      });

      deepStrictEqual(result.package, {
        name: 'root-segment',
        version: '1.0.0',
      });
    });

    it('should handle specific segment name', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            package: { name: 'base-name', version: '1.0.0' },
            segments: {
              users: {
                package: { version: '2.0.0', name: 'users-segment' },
              },
              posts: {
                package: { version: '3.0.0', name: 'posts-segment' },
              },
            },
          },
        },
        outputConfigs: [],
        segmentName: 'users',
        isBundle: false,
        projectPackageJson: undefined,
      });

      deepStrictEqual(result.package, {
        version: '2.0.0',
        name: 'users-segment',
      });
    });
  });

  describe('Configuration Precedence/Override Tests', () => {
    it('should apply correct merge order for package config', () => {
      const projectPackageJson: PackageJson = {
        name: 'project',
        version: '0.1.0',
        description: 'project description',
      };

      const outputConfigs: VovkOutputConfig[] = [
        { package: { version: '0.6.0' } },
        { package: { keywords: ['api', 'vovk'] } },
      ];

      const result = resolveGeneratorConfigValues({
        config: {
          $schema: 'https://vovk.dev/api/schema/v3/config.json',
          outputConfig: {
            package: {
              name: 'schema-package',
              version: '0.2.0',
              license: 'NONE',
            },
            segments: {
              test: {
                package: {
                  version: '0.4.0',
                  authors: ['test-author'],
                  name: 'segment-package',
                },
              },
            },
          },
          bundle: {
            build: () => Promise.resolve(),
            outputConfig: {
              package: {
                version: '0.7.0',
                homepage: 'https://bundle.example.com',
              },
            },
          },
        },
        outputConfigs,
        segmentName: 'test',
        isBundle: true,
        projectPackageJson,
      });

      // Final merged result should follow precedence
      deepStrictEqual(result.package, {
        name: 'segment-package', // from segment outputConfig
        version: '0.7.0', // from configs array (last override)
        description: 'project description', // from projectPackageJson
        license: 'NONE', // from schema outputConfig
        authors: ['test-author'], // from segment outputConfig
        homepage: 'https://bundle.example.com', // from bundle
        keywords: ['api', 'vovk'], // from configs array
      });
    });

    it('should apply correct merge order for openAPIObject', () => {
      const outputConfigs: VovkOutputConfig[] = [
        {
          openAPIObject: {
            info: {
              version: '2.0.0',
              title: 'Updated API',
              contact: { email: 'api@example.com' },
            },
          },
        },
      ];

      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            openAPIObject: {
              info: {
                title: 'Base API',
                version: '1.0.0',
                description: 'Base description',
              },
              servers: [{ url: 'https://api.example.com' }],
            },
          },
        },
        outputConfigs,
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
      });

      deepStrictEqual(result.openAPIObject.info, {
        title: 'Updated API',
        version: '2.0.0',
        description: 'Base description',
        contact: { email: 'api@example.com' },
      });
    });

    it('should handle origin field with last wins behavior', () => {
      const outputConfigs: VovkOutputConfig[] = [
        { origin: 'https://config1.example.com' },
        { origin: null },
        { origin: 'https://config2.example.com' },
      ];

      const result = resolveGeneratorConfigValues({
        config: {
          $schema: 'https://vovk.dev/api/schema/v3/config.json',
          outputConfig: {
            origin: 'https://first.example.com',
            segments: {
              test: {
                origin: 'https://segment.example.com',
              },
            },
          },
          bundle: {
            outputConfig: {
              origin: 'https://bundle.example.com',
            },
          } as VovkStrictConfig['bundle'],
        },
        outputConfigs,
        segmentName: 'test',
        isBundle: true,
        projectPackageJson: undefined,
      });

      // Should take the last non-null value
      strictEqual(result.origin, 'https://bundle.example.com');
    });

    it('should merge imports with defaults', () => {
      const outputConfigs: VovkOutputConfig[] = [
        {
          imports: {
            createRPC: 'customCreateRPC',
          },
        },
      ];

      const result = resolveGeneratorConfigValues({
        config: {
          $schema: 'https://vovk.dev/api/schema/v3/config.json',
          outputConfig: {
            imports: {
              fetcher: '@custom/fetcher',
              validateOnClient: '@custom/validator',
            },
          },
        },
        outputConfigs,
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
      });

      deepStrictEqual(result.imports, {
        fetcher: '@custom/fetcher',
        validateOnClient: '@custom/validator',
        createRPC: 'customCreateRPC',
      });
    });
  });

  describe('Bundle-Specific Tests', () => {
    it('should include bundle configs when isBundle is true', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            package: {
              name: 'base',
              exports: {
                '.': {
                  default: './index.js',
                  types: './index.d.ts',
                },
              },
              type: 'module',
              main: './index.js',
              types: './index.d.ts',
            },
          },
          bundle: {
            build: () => Promise.resolve(),
            outputConfig: {
              package: { name: 'bundled' },
              origin: 'https://bundle.example.com',
            },
          },
        },
        segmentName: null,
        isBundle: true,
        projectPackageJson: undefined,
        outputConfigs: [],
      });

      deepStrictEqual(result.package, {
        name: 'bundled',
        exports: {
          '.': {
            default: './index.js',
            types: './index.d.ts',
          },
        },
        type: 'module',
        main: './index.js',
        types: './index.d.ts',
      });
      strictEqual(result.origin, 'https://bundle.example.com');
    });

    it('should ignore bundle configs when isBundle is false', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          $schema: 'https://vovk.dev/api/schema/v3/config.json',
          outputConfig: {
            package: { name: 'base' },
          },
          bundle: {
            outputConfig: {
              package: { name: 'bundled' },
              origin: 'https://bundle.example.com',
            },
          } as VovkStrictConfig['bundle'],
        },
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
        outputConfigs: [],
      });

      deepStrictEqual(result.package, {
        name: 'base',
      });
      strictEqual(result.origin, '');
    });
  });

  describe('Segment-Specific Tests', () => {
    it('should handle valid segment name', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            segments: {
              users: {
                origin: 'https://users.example.com',
                reExports: { User: './models/User' },
                package: { name: 'users-api' },
                openAPIObject: {
                  info: { title: 'Users API', version: '1.0.0' },
                },
              },
            },
          },
        },
        segmentName: 'users',
        isBundle: false,
        projectPackageJson: undefined,
        outputConfigs: [],
      });

      deepStrictEqual(result.package, {
        name: 'users-api',
      });
      strictEqual(result.origin, 'https://users.example.com');
      deepStrictEqual(result.reExports, { User: './models/User' });
      deepStrictEqual(result.openAPIObject.info, {
        title: 'Users API',
        version: '1.0.0',
        description: undefined,
      });
    });

    it('should ignore non-existent segment name', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            segments: {
              users: {
                package: { name: 'users-api' },
              },
            },
          },
        },
        segmentName: 'nonexistent',
        isBundle: false,
        projectPackageJson: undefined,
        outputConfigs: [],
      });

      // Should not include segment-specific configs
      deepStrictEqual(result.package, {});
    });

    it('should aggregate reExports for composed client', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            reExports: { Base: './base' },
            segments: {
              users: { reExports: { User: './User', Profile: './Profile' } },
              posts: { reExports: { Post: './Post' } },
              comments: { reExports: { Comment: './Comment' } },
            },
          },
        },
        segmentName: null, // composed client
        isBundle: false,
        projectPackageJson: undefined,
        outputConfigs: [],
      });

      // Should merge base reExports with all segments' reExports
      deepStrictEqual(result.reExports, {
        Base: './base',
        User: './User',
        Profile: './Profile',
        Post: './Post',
        Comment: './Comment',
      });
    });
  });

  describe('Package.json Filtering', () => {
    it('should filter package.json to allowed fields only', () => {
      const projectPackageJson: PackageJson = {
        name: 'test-project',
        version: '1.0.0',
        description: 'Test project',
        license: 'MIT',
        author: 'Author 1',
        contributors: ['Author 2', 'Author 3'],
        repository: { type: 'git', url: 'https://github.com/test/repo' },
        homepage: 'https://example.com',
        bugs: { url: 'https://github.com/test/repo/issues' },
        keywords: ['test', 'api'],
        // These should be filtered out
        main: './src/xxx.js',
        module: './dist/xxx.mjs',
        types: './dist/xxx.d.ts',
        scripts: { test: 'jest' },
        dependencies: { vovk: '^1.0.0' },
        devDependencies: { jest: '^29.0.0' },
        peerDependencies: { react: '^18.0.0' },
        engines: { node: '>=18' },
        files: ['dist'],
      };

      const result = resolveGeneratorConfigValues({
        config: undefined,
        outputConfigs: [],
        isBundle: false,
        segmentName: null,
        projectPackageJson,
      });

      // Should only include allowed fields
      deepStrictEqual(result.package, {
        name: 'test-project',
        version: '1.0.0',
        description: 'Test project',
        license: 'MIT',
        author: 'Author 1',
        contributors: ['Author 2', 'Author 3'],
        repository: { type: 'git', url: 'https://github.com/test/repo' },
        homepage: 'https://example.com',
        bugs: { url: 'https://github.com/test/repo/issues' },
        keywords: ['test', 'api'],
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values in configuration paths', () => {
      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            package: undefined,
            origin: null,
            imports: undefined,
          },
        },
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
        outputConfigs: [],
      });

      deepStrictEqual(result.package, {});
      strictEqual(result.origin, '');
      deepStrictEqual(result.imports, {
        fetcher: 'vovk/fetcher',
        validateOnClient: null,
        createRPC: 'vovk/createRPC',
      });
    });

    it('should handle outputConfigs array with sequential merging', () => {
      const outputConfigs: VovkOutputConfig[] = [
        {
          package: { name: 'first', version: '1.0.0' },
          readme: { banner: 'First banner' },
        },
        {
          package: { name: 'second' },
          readme: { description: 'Second description' },
        },
        {
          package: { version: '3.0.0' },
          readme: { banner: 'Third banner' },
        },
      ];

      const result = resolveGeneratorConfigValues({
        config: undefined,
        outputConfigs,
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
      });

      // Should merge sequentially
      deepStrictEqual(result.package, {
        name: 'second', // overridden by second config
        version: '3.0.0', // overridden by third config
      });
      deepStrictEqual(result.readme, {
        banner: 'Third banner', // overridden by third config
        description: 'Second description', // from second config
      });
    });
  });

  describe('Complex Interaction Tests', () => {
    it('should handle bundle + specific segment + configs array all present', () => {
      const projectPackageJson: PackageJson = {
        name: 'project',
        version: '0.0.1',
      };

      const outputConfigs: VovkOutputConfig[] = [
        {
          package: { repository: 'https://github.com/test/repo' },
          origin: 'https://config.example.com',
        },
      ];

      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            package: { license: 'MIT' },
            origin: 'https://base.example.com',
            segments: {
              api: {
                package: { keywords: ['api'], description: 'API segment' },
                origin: 'https://api.example.com',
              },
            },
          },
          bundle: {
            build: () => Promise.resolve(),
            outputConfig: {
              package: { homepage: 'https://bundle.example.com/about' },
              origin: 'https://bundle.example.com',
              samples: { apiRoot: '/api/v2' },
            },
          },
        },
        outputConfigs,
        segmentName: 'api',
        isBundle: true,
        projectPackageJson,
      });

      // Complex merge of all sources
      deepStrictEqual(result.package, {
        name: 'project',
        version: '0.0.1',
        description: 'API segment',
        license: 'MIT',
        keywords: ['api'],
        homepage: 'https://bundle.example.com/about',
        repository: 'https://github.com/test/repo',
      });

      strictEqual(result.origin, 'https://bundle.example.com');
      deepStrictEqual(result.samples, { apiRoot: '/api/v2' });
    });

    it('should handle origin field with all null values', () => {
      const outputConfigs: VovkOutputConfig[] = [{ origin: null }, { origin: null }];

      const result = resolveGeneratorConfigValues({
        config: {
          outputConfig: {
            origin: null,
          },
        },
        outputConfigs,
        segmentName: null,
        isBundle: false,
        projectPackageJson: undefined,
      });

      // Should return empty string when all are null
      strictEqual(result.origin, '');
    });

    it('should handle OpenAPI object defaults correctly', () => {
      const packageJson: PackageJson = {
        name: '@company/api',
        version: '2.0.0',
        description: 'Company API',
      };

      const result = resolveGeneratorConfigValues({
        config: undefined,
        outputConfigs: [],
        isBundle: false,
        segmentName: null,
        projectPackageJson: packageJson,
      });

      // Should create default OpenAPI object from package.json
      deepStrictEqual(result.openAPIObject, {
        openapi: '3.1.0',
        info: {
          title: '@company/api',
          version: '2.0.0',
          description: 'Company API',
        },
      });
    });
  });
});

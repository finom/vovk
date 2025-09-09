import { describe, it } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import type { PackageJson } from 'type-fest';
import {
  type VovkSchema,
  type VovkGeneratorConfigCommon,
  resolveGeneratorConfigValues,
  type KnownAny,
  type VovkStrictConfig,
} from 'vovk';

describe('resolveGeneratorConfigValues', () => {
  describe('Basic Configuration Resolution', () => {
    it('should handle minimal schema with only required fields', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: null,
      });

      // Check defaults
      deepStrictEqual(result.package, {});
      strictEqual(result.origin, '');
      deepStrictEqual(result.imports, {
        fetcher: ['vovk'],
        validateOnClient: null,
        createRPC: ['vovk'],
      });
      deepStrictEqual(result.reExports, {});
      deepStrictEqual(result.readme, {});
      deepStrictEqual(result.snippets, {});
    });

    it('should handle empty configs array', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              origin: 'https://api.example.com',
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        configs: [],
        segmentName: null,
      });

      strictEqual(result.origin, 'https://api.example.com');
    });

    it('should handle null segmentName (composed client)', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          users: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'users',
            segmentType: 'segment',
            controllers: {},
          },
          posts: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'posts',
            segmentType: 'segment',
            controllers: {},
          },
        },
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              segments: {
                users: { reExports: { User: './types/User' } },
                posts: { reExports: { Post: './types/Post' } },
              },
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: null,
      });

      // Should aggregate reExports from all segments
      deepStrictEqual(result.reExports, {
        User: './types/User',
        Post: './types/Post',
      });
    });

    it('should handle empty string segmentName (root segment)', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          '': {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: '',
            segmentType: 'segment',
            controllers: {},
            meta: {
              package: { name: 'root-segment' },
            },
          },
        },
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              segments: {
                '': {
                  package: { version: '1.0.0' },
                },
              },
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: '',
      });

      deepStrictEqual(result.package, {
        name: 'root-segment',
        version: '1.0.0',
      });
    });

    it('should handle specific segment name', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          users: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'users',
            segmentType: 'segment',
            controllers: {},
            meta: {
              package: { name: 'users-segment' },
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: 'users',
      });

      deepStrictEqual(result.package, {
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

      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          test: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'test',
            segmentType: 'segment',
            controllers: {},
            meta: {
              package: {
                name: 'segment-package',
                version: '0.3.0',
              },
            },
          },
        },
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              package: {
                name: 'schema-package',
                version: '0.2.0',
                license: 'MIT',
              },
              segments: {
                test: {
                  package: {
                    version: '0.4.0',
                    authors: ['test-author'],
                  },
                },
              },
            },
            bundle: {
              generatorConfig: {
                package: {
                  version: '0.5.0',
                  homepage: 'https://bundle.example.com',
                },
              },
            } as VovkStrictConfig['bundle'],
          },
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [
        { package: { version: '0.6.0' } },
        { package: { keywords: ['api', 'vovk'] } },
      ];

      const result = resolveGeneratorConfigValues({
        schema,
        configs,
        segmentName: 'test',
        isBundle: true,
        projectPackageJson,
      });

      // Final merged result should follow precedence
      deepStrictEqual(result.package, {
        name: 'segment-package', // from segment meta
        version: '0.6.0', // from configs array (last override)
        description: 'project description', // from projectPackageJson
        license: 'MIT', // from schema generatorConfig
        authors: ['test-author'], // from segment generatorConfig
        homepage: 'https://bundle.example.com', // from bundle
        keywords: ['api', 'vovk'], // from configs array
      });
    });

    it('should apply correct merge order for openAPIObject', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
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
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [
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
        schema,
        configs,
        segmentName: null,
      });

      deepStrictEqual(result.openAPIObject.info, {
        title: 'Updated API',
        version: '2.0.0',
        description: 'Base description',
        contact: { email: 'api@example.com' },
      });
    });

    it('should handle origin field with last wins behavior', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              origin: 'https://first.example.com',
              segments: {
                test: {
                  origin: 'https://segment.example.com',
                },
              },
            },
            bundle: {
              generatorConfig: {
                origin: 'https://bundle.example.com',
              },
            } as VovkStrictConfig['bundle'],
          },
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [
        { origin: 'https://config1.example.com' },
        { origin: null },
        { origin: 'https://config2.example.com' },
      ];

      const result = resolveGeneratorConfigValues({
        schema,
        configs,
        segmentName: 'test',
        isBundle: true,
      });

      // Should take the last non-null value
      strictEqual(result.origin, 'https://config2.example.com');
    });

    it('should merge imports with defaults', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              imports: {
                fetcher: '@custom/fetcher',
                validateOnClient: '@custom/validator',
              },
            },
          },
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [
        {
          imports: {
            createRPC: ['@custom/rpc', 'createCustomRPC'],
          },
        },
      ];

      const result = resolveGeneratorConfigValues({
        schema,
        configs,
        segmentName: null,
      });

      deepStrictEqual(result.imports, {
        fetcher: '@custom/fetcher',
        validateOnClient: '@custom/validator',
        createRPC: ['@custom/rpc', 'createCustomRPC'],
      });
    });
  });

  describe('Bundle-Specific Tests', () => {
    it('should include bundle configs when isBundle is true', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              package: { name: 'base' },
            },
            bundle: {
              generatorConfig: {
                package: { name: 'bundled' },
                origin: 'https://bundle.example.com',
              },
            } as VovkStrictConfig['bundle'],
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: null,
        isBundle: true,
      });

      deepStrictEqual(result.package, { name: 'bundled' });
      strictEqual(result.origin, 'https://bundle.example.com');
    });

    it('should ignore bundle configs when isBundle is false', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              package: { name: 'base' },
            },
            bundle: {
              generatorConfig: {
                package: { name: 'bundled' },
                origin: 'https://bundle.example.com',
              },
            } as VovkStrictConfig['bundle'],
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: null,
        isBundle: false,
      });

      deepStrictEqual(result.package, { name: 'base' });
      strictEqual(result.origin, '');
    });
  });

  describe('Segment-Specific Tests', () => {
    it('should handle valid segment name', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          users: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'users',
            segmentType: 'segment',
            controllers: {},
            meta: {
              package: { name: 'users-api' },
              openAPIObject: {
                info: { title: 'Users API', version: '1.0.0' },
              },
            },
          },
        },
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              segments: {
                users: {
                  origin: 'https://users.example.com',
                  reExports: { User: './models/User' },
                },
              },
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: 'users',
      });

      deepStrictEqual(result.package, { name: 'users-api' });
      strictEqual(result.origin, 'https://users.example.com');
      deepStrictEqual(result.reExports, { User: './models/User' });
      deepStrictEqual(result.openAPIObject.info, {
        title: 'Users API',
        version: '1.0.0',
        description: undefined,
      });
    });

    it('should ignore non-existent segment name', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          users: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'users',
            segmentType: 'segment',
            controllers: {},
            meta: {
              package: { name: 'users-api' },
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: 'nonexistent',
      });

      // Should not include segment-specific configs
      deepStrictEqual(result.package, {});
    });

    it('should aggregate reExports for composed client', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          users: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'users',
            segmentType: 'segment',
            controllers: {},
          },
          posts: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'posts',
            segmentType: 'segment',
            controllers: {},
          },
          comments: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'comments',
            segmentType: 'segment',
            controllers: {},
          },
        },
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              reExports: { Base: './base' },
              segments: {
                users: { reExports: { User: './User', Profile: './Profile' } },
                posts: { reExports: { Post: './Post' } },
                comments: { reExports: { Comment: './Comment' } },
              },
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: null, // composed client
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
        authors: ['Author 1'],
        repository: { type: 'git', url: 'https://github.com/test/repo' },
        homepage: 'https://example.com',
        bugs: { url: 'https://github.com/test/repo/issues' },
        keywords: ['test', 'api'],
        // These should be filtered out
        main: './src/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        scripts: { test: 'jest' },
        dependencies: { vovk: '^1.0.0' },
        devDependencies: { jest: '^29.0.0' },
        peerDependencies: { react: '^18.0.0' },
        engines: { node: '>=18' },
        files: ['dist'],
      };

      const result = resolveGeneratorConfigValues({
        schema: {
          $schema: 'https://vovk.dev/api/schema/v3/schema.json',
          segments: {},
        },
        segmentName: null,
        projectPackageJson,
      });

      // Should only include allowed fields
      deepStrictEqual(result.package, {
        name: 'test-project',
        version: '1.0.0',
        description: 'Test project',
        license: 'MIT',
        authors: ['Author 1'],
        repository: { type: 'git', url: 'https://github.com/test/repo' },
        homepage: 'https://example.com',
        bugs: { url: 'https://github.com/test/repo/issues' },
        keywords: ['test', 'api'],
      });

      // Verify excluded fields are not present
      strictEqual('main' in result.package, false);
      strictEqual('scripts' in result.package, false);
      strictEqual('dependencies' in result.package, false);
    });

    it('should handle missing allowed fields gracefully', () => {
      const projectPackageJson: PackageJson = {
        name: 'minimal-project',
        // Only name is provided
        scripts: { test: 'jest' }, // Should be filtered out
      };

      const result = resolveGeneratorConfigValues({
        schema: {
          $schema: 'https://vovk.dev/api/schema/v3/schema.json',
          segments: {},
        },
        segmentName: null,
        projectPackageJson,
      });

      deepStrictEqual(result.package, {
        name: 'minimal-project',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values in configuration paths', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              package: null as KnownAny,
              origin: null,
              imports: null as KnownAny,
            },
          },
        },
      };

      const result = resolveGeneratorConfigValues({
        schema,
        segmentName: null,
      });

      // Should handle null/undefined gracefully
      deepStrictEqual(result.package, {});
      strictEqual(result.origin, '');
      deepStrictEqual(result.imports, {
        fetcher: ['vovk'],
        validateOnClient: null,
        createRPC: ['vovk'],
      });
    });

    it('should handle empty objects at various levels', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {},
          },
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [{}, {}, {}];

      const result = resolveGeneratorConfigValues({
        schema,
        configs,
        segmentName: null,
      });

      // Should return defaults
      deepStrictEqual(result.package, {});
      strictEqual(result.origin, '');
      deepStrictEqual(result.reExports, {});
    });

    it('should handle configs array with sequential merging', () => {
      const configs: VovkGeneratorConfigCommon[] = [
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
        schema: {
          $schema: 'https://vovk.dev/api/schema/v3/schema.json',
          segments: {},
        },
        configs,
        segmentName: null,
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

      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {
          api: {
            $schema: 'https://vovk.dev/api/schema/v3/segment.json',
            emitSchema: true,
            segmentName: 'api',
            segmentType: 'segment',
            controllers: {},
            meta: {
              package: { description: 'API segment' },
            },
          },
        },
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              package: { license: 'MIT' },
              origin: 'https://base.example.com',
              segments: {
                api: {
                  package: { keywords: ['api'] },
                  origin: 'https://api.example.com',
                },
              },
            },
            bundle: {
              generatorConfig: {
                package: { homepage: 'https://bundle.example.com' },
                origin: 'https://bundle.example.com',
                snippets: { apiRoot: '/api/v2' },
              },
            } as VovkStrictConfig['bundle'],
          },
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [
        {
          package: { repository: 'https://github.com/test/repo' },
          origin: 'https://config.example.com',
        },
      ];

      const result = resolveGeneratorConfigValues({
        schema,
        configs,
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
        homepage: 'https://bundle.example.com',
        repository: 'https://github.com/test/repo',
      });

      strictEqual(result.origin, 'https://config.example.com');
      deepStrictEqual(result.snippets, { apiRoot: '/api/v2' });
    });

    it('should handle origin field with all null values', () => {
      const schema: VovkSchema = {
        $schema: 'https://vovk.dev/api/schema/v3/schema.json',
        segments: {},
        meta: {
          $schema: 'https://vovk.dev/api/schema/v3/meta.json',
          config: {
            $schema: 'https://vovk.dev/api/schema/v3/config.json',
            generatorConfig: {
              origin: null,
            },
          },
        },
      };

      const configs: VovkGeneratorConfigCommon[] = [{ origin: null }, { origin: null }];

      const result = resolveGeneratorConfigValues({
        schema,
        configs,
        segmentName: null,
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
        schema: {
          $schema: 'https://vovk.dev/api/schema/v3/schema.json',
          segments: {},
        },
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

import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkSchema } from 'vovk';
import { type VovkStrictConfig, vovkSchemaToOpenAPI } from 'vovk/internal';

// biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
type Obj = Record<string, any>;

const controller = (rpcModuleName: string, prefix: string) => ({
  rpcModuleName,
  prefix,
  handlers: { list: { path: '', httpMethod: 'GET', operationObject: { summary: 'list' }, validation: {} } },
});

const segment = (segmentName: string, controllers: Obj) => ({
  $schema: 'https://vovk.dev/segment',
  segmentName,
  emitSchema: true,
  segmentType: 'segment',
  controllers,
});

const schema = {
  $schema: 'https://vovk.dev/schema',
  segments: {
    admin: segment('admin', { UserRPC: controller('UserRPC', 'users'), HttpRequest: controller('HttpRequest', 'r') }),
    customer: segment('customer', { UserRPC: controller('UserRPC', 'users'), UserRpc: controller('UserRpc', 'u') }),
  },
} as unknown as VovkSchema;

const rustSamples = (segmentName: string | null) => {
  const { paths } = vovkSchemaToOpenAPI({
    config: { outputConfig: { samples: {} } } as unknown as VovkStrictConfig,
    schema,
    outputConfigs: [],
    isBundle: false,
    segmentName,
    projectPackageJson: { name: 'acme' },
  }).openAPIObject as Obj;
  return Object.fromEntries(
    Object.entries(paths as Obj).map(([path, item]) => [
      path,
      (item.get['x-codeSamples'] as Obj[]).find(({ lang }) => lang === 'rust')?.source as string,
    ])
  );
};

const moduleOf = (sample: string) => sample.split('\n')[0];

describe('The Rust module names in the code samples', () => {
  it('Are the names the crate gives its modules, in schema order', () => {
    const samples = rustSamples(null);
    strictEqual(moduleOf(samples['/api/admin/users']), 'use acme::user_rpc;');
    // the crate's own module http_request is taken
    strictEqual(moduleOf(samples['/api/admin/r']), 'use acme::http_request_2;');
    strictEqual(moduleOf(samples['/api/customer/users']), 'use acme::user_rpc_2;');
    strictEqual(moduleOf(samples['/api/customer/u']), 'use acme::user_rpc_3;');
    strictEqual(samples['/api/customer/u'].includes('user_rpc_3::list('), true);
  });

  it('Count only the segment a segmented crate is built from', () => {
    const samples = rustSamples('customer');
    strictEqual(moduleOf(samples['/api/customer/users']), 'use acme::user_rpc;');
    strictEqual(moduleOf(samples['/api/customer/u']), 'use acme::user_rpc_2;');
  });
});

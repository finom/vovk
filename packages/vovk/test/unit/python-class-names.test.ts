import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkSchema } from 'vovk';
import { createCodeSamples, type VovkStrictConfig, vovkSchemaToOpenAPI } from 'vovk/internal';

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

// User$RPC and User_RPC are one Python identifier, client is the package's ApiClient
const schema = {
  $schema: 'https://vovk.dev/schema',
  segments: {
    admin: segment('admin', {
      User$RPC: controller('User$RPC', 'users'),
      client: controller('client', 'c'),
      User_RPC_2: controller('User_RPC_2', 'u2'),
    }),
    customer: segment('customer', { User_RPC: controller('User_RPC', 'users') }),
  },
} as unknown as VovkSchema;

const pythonSamples = (segmentName: string | null) => {
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
      (item.get['x-codeSamples'] as Obj[]).find(({ lang }) => lang === 'python')?.source as string,
    ])
  );
};

const classOf = (sample: string) => sample.match(/^response = (\w+)\.list\(/m)?.[1];

describe('The Python class names in the code samples', () => {
  it('Are the names the package gives its classes: the last module of a name keeps it', () => {
    const samples = pythonSamples(null);
    // User_RPC_2 is another module's name
    strictEqual(classOf(samples['/api/admin/users']), 'User_RPC_3');
    strictEqual(samples['/api/admin/users'].includes('from acme import User_RPC_3\n'), true);
    strictEqual(classOf(samples['/api/admin/c']), 'client_2');
    strictEqual(classOf(samples['/api/admin/u2']), 'User_RPC_2');
    strictEqual(classOf(samples['/api/customer/users']), 'User_RPC');
  });

  it('Count only the segment a segmented package is built from', () => {
    const samples = pythonSamples('admin');
    strictEqual(classOf(samples['/api/admin/users']), 'User_RPC');
    strictEqual(classOf(samples['/api/admin/c']), 'client_2');
  });

  it('Take the class name given', () => {
    const controllerSchema = controller('User$RPC', 'users');
    const { py } = createCodeSamples({
      handlerName: 'list',
      handlerSchema: controllerSchema.handlers.list as Obj as Parameters<typeof createCodeSamples>[0]['handlerSchema'],
      controllerSchema,
      package: { name: 'acme' },
      config: {},
      pythonClassName: 'User_RPC_2',
    });
    strictEqual(classOf(py), 'User_RPC_2');
    strictEqual(py.includes('from acme import User_RPC_2\n'), true);
  });
});

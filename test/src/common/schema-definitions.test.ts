import { ok } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { Ajv } from 'ajv';
import type { VovkSchema } from 'vovk';
import { openAPIToVovkSchema, VovkSchemaIdEnum } from 'vovk/internal';
import V3SchemaService from '../../../docs/src/modules/schema/v3-schema-service.ts';

const schemaDir = path.join(import.meta.dirname, '../../.vovk-schema');

// the definitions vovk.dev serves, each one under the URL a generated file names in its $schema
function getValidator(id: VovkSchemaIdEnum) {
  const ajv = new Ajv({ strict: false, allErrors: true });
  // the meta-schemas and the OpenAPI schema the definitions refer to, offline
  ajv.addSchema({ $id: 'https://json-schema.org/draft-07/schema' });
  ajv.addSchema({ $id: 'https://json-schema.org/draft/2020-12/schema' });
  ajv.addSchema({ $id: 'https://spec.openapis.org/oas/3.1/schema/2021-05-20', $defs: { operation: {} } });
  ajv.addSchema([
    V3SchemaService.getConfigDefinition(),
    V3SchemaService.getMetaDefinition(),
    V3SchemaService.getSegmentDefinition(),
    V3SchemaService.getFullDefinition(),
  ]);
  const validate = ajv.getSchema(id);
  ok(validate, `no definition has the id ${id}`);
  return (data: unknown) => ok(validate(data), ajv.errorsText(validate.errors));
}

const mixin = openAPIToVovkSchema({
  source: {
    object: {
      openapi: '3.1.0',
      info: { title: 'Petstore', version: '1.0.0' },
      servers: [{ url: 'https://petstore.example.com' }],
      paths: { '/pets/{id}': { get: { operationId: 'getPet', responses: { '200': { description: 'ok' } } } } },
    },
  },
  getModuleName: () => 'PetstoreAPI',
  getMethodName: ({ operationObject }) => operationObject.operationId ?? 'op',
  segmentName: 'petstore',
}).segments.petstore;

const read = (file: string) => JSON.parse(fs.readFileSync(path.join(schemaDir, file), 'utf-8'));

describe('Published schema definitions', () => {
  const segmentFiles = fs
    .readdirSync(schemaDir, { recursive: true, encoding: 'utf-8' })
    .filter((file) => file.endsWith('.json') && file !== '_meta.json');

  it('Accept every segment the test app emits, and an OpenAPI mixin', () => {
    const validate = getValidator(VovkSchemaIdEnum.SEGMENT);
    for (const file of segmentFiles) validate(read(file));
    validate(JSON.parse(JSON.stringify(mixin)));
  });

  it('Accept the meta file', () => {
    getValidator(VovkSchemaIdEnum.META)(read('_meta.json'));
  });

  it('Accept a full schema as a client carries it', () => {
    const schema: VovkSchema = {
      $schema: VovkSchemaIdEnum.SCHEMA,
      segments: Object.fromEntries([
        ...segmentFiles.map((file) => [read(file).segmentName, read(file)]),
        ['petstore', mixin],
      ]),
      meta: read('_meta.json'),
    };
    getValidator(VovkSchemaIdEnum.SCHEMA)(JSON.parse(JSON.stringify(schema)));
  });
});

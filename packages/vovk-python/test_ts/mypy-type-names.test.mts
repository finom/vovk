import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { VovkJSONSchemaBase } from 'vovk';
import { convertJSONSchemaToPythonDataType } from '../index.js';

// In a class body mypy reads `Name = str` or `Name = _Other` as a variable, not a type ("Variable ... is not valid as
// a type"), so `body: PetstoreAPI.UpdatePetBody` and the methods' return types fail; `Name: TypeAlias = ...` is a type
test('a type name the docs tell users to annotate with is a type for mypy', async (t) => {
  const cases: [string, VovkJSONSchemaBase][] = [
    ['a string', { type: 'string' }],
    ['a number', { type: 'number' }],
    [
      'a $ref to a named schema, as a mixin response is',
      {
        $ref: '#/$defs/Pet',
        $defs: { Pet: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
      },
    ],
  ];

  for (const [label, schema] of cases) {
    await t.test(label, () => {
      const result = convertJSONSchemaToPythonDataType({
        schema,
        namespace: 'PetstoreAPI',
        className: 'GetPetOutput',
        pad: 4,
      });
      const declaration = result.split('\n').find((line) => /^\s*(class )?GetPetOutput\b/.test(line)) ?? '';

      assert.match(declaration, /^\s*(class GetPetOutput\(|GetPetOutput = TypedDict\(|GetPetOutput: TypeAlias = )/);
    });
  }
});

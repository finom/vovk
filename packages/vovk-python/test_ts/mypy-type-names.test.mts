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
    // a class and an alias of one name: mypy reports no-redef, pyright refuses the name as a type
    [
      'an object that may be null, as an OpenAPI 3.0 mixin body or response is',
      { type: ['object', 'null'], properties: { name: { type: 'string' } }, required: ['name'] },
    ],
    [
      'an object that may be null, with a key that is not a plain name',
      { type: ['object', 'null'], properties: { 'content-type': { type: 'string' } } },
    ],
    ['an object or an array', { type: ['object', 'array'], properties: { name: { type: 'string' } } }],
  ];

  for (const [label, schema] of cases) {
    await t.test(label, () => {
      const result = convertJSONSchemaToPythonDataType({
        schema,
        namespace: 'PetstoreAPI',
        className: 'GetPetOutput',
        pad: 4,
      });
      const declarations = result.split('\n').filter((line) => /^\s*(class )?GetPetOutput\b/.test(line));

      assert.equal(declarations.length, 1, result);
      assert.match(declarations[0], /^\s*(class GetPetOutput\(|GetPetOutput = TypedDict\(|GetPetOutput: TypeAlias = )/);
    });
  }
});

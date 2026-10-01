import assert from 'node:assert';
import fs from 'node:fs';
import { describe, test } from 'node:test';

const readTemplate = (file: string) =>
  fs.readFileSync(new URL(`../client-templates/rs-src/${file}`, import.meta.url), 'utf-8');

describe('rs-src templates', () => {
  test('the schema is compiled into the crate, so a binary runs without the source tree', () => {
    const source = readTemplate('read_full_schema.rs');

    assert.ok(source.includes('include_str!("schema.json")'), source);
    assert.ok(!source.includes('CARGO_MANIFEST_DIR'), source);
    assert.ok(!source.includes('File::open'), source);
  });
});

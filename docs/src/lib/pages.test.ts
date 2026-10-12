import assert from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { frontMatterSource, pageTitle } from './page-source';

const APP = path.join(import.meta.dirname, '../app');
const pages = readdirSync(APP, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('page.mdx'))
  .map((file) => ({ file, mdx: readFileSync(path.join(APP, file), 'utf8') }));

const repeated = (values: string[]) => values.filter((value, i) => values.indexOf(value) !== i);

// Search results and link previews show the description; they cut it at about 160 characters.
test('every page has a description of its own, JSON-quoted, at most 160 characters', () => {
  const descriptions = pages.map(({ file, mdx }) => {
    const value = frontMatterSource(mdx).match(/^description: (.+)$/m)?.[1];
    assert.ok(value, `${file} has no description in its front matter`);
    const description = JSON.parse(value);
    assert.strictEqual(typeof description, 'string', `${file}: the description is not a JSON string`);
    assert.ok(description.length > 0 && description.length <= 160, `${file}: ${description.length} characters`);
    return description as string;
  });
  assert.deepStrictEqual(repeated(descriptions), []);
});

test('every page has a title of its own', () => {
  const titles = pages.map(({ file, mdx }) => {
    const title = pageTitle(mdx);
    assert.ok(title, `${file} has no title`);
    return title;
  });
  assert.deepStrictEqual(repeated(titles), []);
});

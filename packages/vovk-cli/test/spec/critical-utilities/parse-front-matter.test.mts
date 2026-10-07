import assert from 'node:assert';
import { describe, it } from 'node:test';
import { parseFrontMatter } from '../../../dist/utils/parse-front-matter.mjs';

await describe('parseFrontMatter', async () => {
  await it('Reads the data and the code after it', () => {
    assert.deepStrictEqual(parseFrontMatter("---\nimports: ['a', 'b']\n---\nexport const x = 1;\n"), {
      data: { imports: ['a', 'b'] },
      content: 'export const x = 1;\n',
    });
  });

  await it('Reads Windows line endings', () => {
    assert.deepStrictEqual(parseFrontMatter('---\r\nfileName: x.ts\r\noutDir: src\r\n---\r\ncode\r\n'), {
      data: { fileName: 'x.ts', outDir: 'src' },
      content: 'code\r\n',
    });
  });

  await it('Leaves a template without front matter as it is', () => {
    for (const text of ['code', '', '----\nnot: front matter\n---\n', ' ---\na: 1\n---\n']) {
      assert.deepStrictEqual(parseFrontMatter(text), { data: {}, content: text });
    }
  });

  await it('Reads an empty or comment-only block as no data', () => {
    assert.deepStrictEqual(parseFrontMatter('---\n---\ncode'), { data: {}, content: 'code' });
    assert.deepStrictEqual(parseFrontMatter('---\n# nothing here\n---\ncode'), { data: {}, content: 'code' });
  });

  await it('Skips a byte order mark and a language name after the opening line', () => {
    assert.deepStrictEqual(parseFrontMatter('﻿---yaml\nfileName: x.ts\n---\ncode'), {
      data: { fileName: 'x.ts' },
      content: 'code',
    });
    assert.deepStrictEqual(parseFrontMatter('---json\n{ "fileName": "x.ts" }\n---\ncode'), {
      data: { fileName: 'x.ts' },
      content: 'code',
    });
  });

  await it('Reads a block with no closing line as front matter only', () => {
    assert.deepStrictEqual(parseFrontMatter('---\nfileName: x.ts\n'), { data: { fileName: 'x.ts' }, content: '' });
  });

  await it('Throws on invalid YAML', () => {
    assert.throws(() => parseFrontMatter('---\nimports: [a\n---\ncode'));
  });
});

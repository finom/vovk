import assert from 'node:assert';
import { test, describe } from 'node:test';
import {
  convertFileTrees,
  convertImages,
  convertIFrames,
  convertYoutube,
  convertVideo,
  removeJsxComponents,
  removeHtmlTags,
  stripHtmlTagsOutsideCode,
  stripImportsOutsideCode,
  unwrapJsxComponents,
  resolveLinks,
  removeShieldBadges,
  transformContent,
} from './contextTransforms.js';

// --- FileTree ---

describe('convertFileTrees', () => {
  test('simple flat folder with files', () => {
    const input = `<FileTree>
  <FileTree.Folder name="dist" defaultOpen>
    <FileTree.File name="package.json" />
    <FileTree.File name="README.md" />
    <FileTree.File name="index.js" />
  </FileTree.Folder>
</FileTree>`;

    const expected = `\`\`\`
dist/
  package.json
  README.md
  index.js
\`\`\``;

    assert.strictEqual(convertFileTrees(input), expected);
  });

  test('nested folders', () => {
    const input = `<FileTree>
  <FileTree.Folder name=".vovk-schema" defaultOpen>
    <FileTree.File name="root.json" />
    <FileTree.Folder name="customer" defaultOpen>
      <FileTree.File name="static.json" />
    </FileTree.Folder>
    <FileTree.File name="_meta.json" />
  </FileTree.Folder>
</FileTree>`;

    const expected = `\`\`\`
.vovk-schema/
  root.json
  customer/
    static.json
  _meta.json
\`\`\``;

    assert.strictEqual(convertFileTrees(input), expected);
  });

  test('JSX expression names with annotations', () => {
    const input = `<FileTree>
  <FileTree.Folder name="src/client" defaultOpen>
    <FileTree.File
      name={
        <span>
          index.ts{' '}
          <span className="text-gray-500">
            (imports <code>./schema.ts</code>)
          </span>
        </span>
      }
    />
  </FileTree.Folder>
</FileTree>`;

    const expected = `\`\`\`
src/client/
  index.ts (imports ./schema.ts)
\`\`\``;

    assert.strictEqual(convertFileTrees(input), expected);
  });

  test('JSX name without {" "} spacer', () => {
    const input = `<FileTree>
  <FileTree.Folder name="src/app" defaultOpen>
    <FileTree.File
      name={
        <span>
          page.tsx <span className="text-gray-500">domain: multitenant.vovk.dev</span>
        </span>
      }
    />
  </FileTree.Folder>
</FileTree>`;

    const result = convertFileTrees(input);
    assert.ok(result.includes('page.tsx domain: multitenant.vovk.dev'));
  });

  test('deeply nested folders', () => {
    const input = `<FileTree>
  <FileTree.Folder name="a" defaultOpen>
    <FileTree.Folder name="b" defaultOpen>
      <FileTree.Folder name="c" defaultOpen>
        <FileTree.File name="deep.txt" />
      </FileTree.Folder>
    </FileTree.Folder>
  </FileTree.Folder>
</FileTree>`;

    const expected = `\`\`\`
a/
  b/
    c/
      deep.txt
\`\`\``;

    assert.strictEqual(convertFileTrees(input), expected);
  });

  test('preserves surrounding content', () => {
    const input = `Before.\n\n<FileTree>\n  <FileTree.Folder name="d" defaultOpen>\n    <FileTree.File name="f" />\n  </FileTree.Folder>\n</FileTree>\n\nAfter.`;
    const result = convertFileTrees(input);
    assert.ok(result.startsWith('Before.'));
    assert.ok(result.endsWith('After.'));
    assert.ok(result.includes('```\nd/\n  f\n```'));
  });

  test('multiple FileTree blocks', () => {
    const input = `<FileTree>\n  <FileTree.Folder name="a" defaultOpen>\n    <FileTree.File name="1.txt" />\n  </FileTree.Folder>\n</FileTree>\n\n<FileTree>\n  <FileTree.Folder name="b" defaultOpen>\n    <FileTree.File name="2.txt" />\n  </FileTree.Folder>\n</FileTree>`;
    const result = convertFileTrees(input);
    assert.ok(result.includes('a/\n  1.txt'));
    assert.ok(result.includes('b/\n  2.txt'));
  });
});

// --- Images ---

describe('convertImages', () => {
  test('img with src and alt', () => {
    assert.strictEqual(convertImages('<img src="/foo.png" alt="A screenshot" />'), '![A screenshot](/foo.png)');
  });

  test('img alt before src', () => {
    assert.strictEqual(convertImages('<img alt="Logo" src="/logo.svg" />'), '![Logo](/logo.svg)');
  });

  test('Image component (Next.js)', () => {
    assert.strictEqual(convertImages('<Image src="/photo.jpg" alt="Photo" />'), '![Photo](/photo.jpg)');
  });

  test('img with no alt', () => {
    assert.strictEqual(convertImages('<img src="/icon.png" />'), '![](/icon.png)');
  });

  test('img with extra attributes', () => {
    assert.strictEqual(
      convertImages('<img alt="Badge" src="https://img.shields.io/badge" className="hidden" />'),
      '![Badge](https://img.shields.io/badge)'
    );
  });

  test('does not touch non-image tags', () => {
    assert.strictEqual(convertImages('<div>hello</div>'), '<div>hello</div>');
  });
});

// --- IFrame → Link ---

describe('convertIFrames', () => {
  test('converts IFrame with children to Link', () => {
    assert.strictEqual(
      convertIFrames('<IFrame src="https://hello-world.vovk.dev" width="100%" height="780px"></IFrame>'),
      'Link: https://hello-world.vovk.dev'
    );
  });

  test('converts self-closing IFrame to Link', () => {
    assert.strictEqual(convertIFrames('<IFrame src="https://example.com" />'), 'Link: https://example.com');
  });

  test('does not touch other components', () => {
    assert.strictEqual(convertIFrames('<Steps>content</Steps>'), '<Steps>content</Steps>');
  });
});

// --- Youtube → YouTube: link ---

describe('convertYoutube', () => {
  test('converts Youtube to YouTube: link', () => {
    assert.strictEqual(
      convertYoutube('<Youtube src="https://www.youtube.com/embed/lQ-F6U_1niw" className="mt-2" />'),
      'YouTube: https://www.youtube.com/embed/lQ-F6U_1niw'
    );
  });

  test('does not touch other components', () => {
    assert.strictEqual(convertYoutube('<Image src="/x.png" />'), '<Image src="/x.png" />');
  });
});

// --- Video ---

describe('convertVideo', () => {
  test('converts video with absolute src to Video: link', () => {
    assert.strictEqual(
      convertVideo('<video src="/video/kanban_mcp.mp4" type="video/mp4" className=\'mt-4\' controls loop />'),
      'Video: https://vovk.dev/video/kanban_mcp.mp4'
    );
  });

  test('converts video with full URL', () => {
    assert.strictEqual(
      convertVideo('<video src="https://example.com/vid.mp4" controls />'),
      'Video: https://example.com/vid.mp4'
    );
  });

  test('does not touch other tags', () => {
    assert.strictEqual(convertVideo('<Image src="/x.png" />'), '<Image src="/x.png" />');
  });
});

// --- Remove JSX components ---

describe('removeJsxComponents', () => {
  test('removes self-closing components', () => {
    assert.strictEqual(removeJsxComponents('<CodeOrbit />'), '');
    assert.strictEqual(removeJsxComponents('<PollExample />'), '');
    assert.strictEqual(removeJsxComponents('<ColdStartChart coldStartData={[1,2]} />'), '');
    assert.strictEqual(removeJsxComponents('<JSONLinesExample />'), '');
    assert.strictEqual(removeJsxComponents('<ProgressiveExample />'), '');
    assert.strictEqual(removeJsxComponents('<AppAlike />'), '');
    assert.strictEqual(removeJsxComponents('<DocIndexCards meta={meta} icons={icons} hrefPrefix="x" />'), '');
  });

  test('removes components with children', () => {
    assert.strictEqual(removeJsxComponents('<NoSSR>\n  <Asciinema src="/x.cast" />\n</NoSSR>'), '');
  });

  test('does not touch unrelated components', () => {
    assert.strictEqual(removeJsxComponents('<Steps>keep</Steps>'), '<Steps>keep</Steps>');
  });
});

// --- Unwrap JSX components ---

describe('unwrapJsxComponents', () => {
  test('removes Steps tags but keeps content', () => {
    const input = '<Steps>\n### Step 1\nDo this\n\n### Step 2\nDo that\n</Steps>';
    const result = unwrapJsxComponents(input);
    assert.ok(!result.includes('<Steps>'));
    assert.ok(!result.includes('</Steps>'));
    assert.ok(result.includes('### Step 1'));
    assert.ok(result.includes('Do this'));
  });

  test('removes Tabs and Tabs.Tab tags', () => {
    const input =
      '<Tabs items={["npm", "yarn"]}>\n<Tabs.Tab>\nnpm install\n</Tabs.Tab>\n<Tabs.Tab>\nyarn add\n</Tabs.Tab>\n</Tabs>';
    const result = unwrapJsxComponents(input);
    assert.ok(!result.includes('<Tabs'));
    assert.ok(result.includes('npm install'));
    assert.ok(result.includes('yarn add'));
  });

  test('removes Callout tags but keeps content', () => {
    const input = '<Callout type="info" emoji="ℹ️">\n  Some important note.\n</Callout>';
    const result = unwrapJsxComponents(input);
    assert.ok(!result.includes('<Callout'));
    assert.ok(!result.includes('</Callout>'));
    assert.ok(result.includes('Some important note.'));
  });

  test('does not touch regular HTML or other components', () => {
    const input = '<div>hello</div><CodeOrbit />';
    assert.strictEqual(unwrapJsxComponents(input), input);
  });
});

// --- HTML tag stripping ---

describe('removeHtmlTags', () => {
  test('removes basic tags', () => {
    assert.strictEqual(removeHtmlTags('<div>hello</div>'), 'hello');
  });

  test('removes self-closing tags', () => {
    assert.strictEqual(removeHtmlTags('<br />'), '');
  });

  test('removes tags with attributes', () => {
    assert.strictEqual(removeHtmlTags('<div className="foo">text</div>'), 'text');
  });

  test('preserves React components (uppercase)', () => {
    assert.strictEqual(removeHtmlTags('<CodeOrbit />'), '<CodeOrbit />');
  });

  test('removes nested HTML tags', () => {
    assert.strictEqual(removeHtmlTags('<div><span>deep</span></div>'), 'deep');
  });
});

describe('stripHtmlTagsOutsideCode', () => {
  test('strips HTML outside code blocks', () => {
    const input = '<div>hello</div>\n\n```html\n<div>keep me</div>\n```';
    const result = stripHtmlTagsOutsideCode(input);
    assert.ok(result.includes('hello'));
    assert.ok(result.includes('<div>keep me</div>'));
  });

  test('preserves multiple code blocks', () => {
    const input = '<b>bold</b>\n```\n<b>keep</b>\n```\n<i>italic</i>\n```\n<i>keep2</i>\n```';
    const result = stripHtmlTagsOutsideCode(input);
    assert.ok(!result.includes('<b>bold</b>'));
    assert.ok(result.includes('<b>keep</b>'));
    assert.ok(!result.includes('<i>italic</i>'));
    assert.ok(result.includes('<i>keep2</i>'));
  });

  test('collapses excessive blank lines', () => {
    const input = '<div></div>\n\n\n\n\ntext';
    const result = stripHtmlTagsOutsideCode(input);
    assert.ok(!result.includes('\n\n\n'));
  });
});

// --- Shield badges ---

describe('removeShieldBadges', () => {
  test('removes standalone badge', () => {
    assert.strictEqual(removeShieldBadges('![NPM Version](https://img.shields.io/npm/v/vovk)'), '');
  });

  test('removes linked badge', () => {
    assert.strictEqual(
      removeShieldBadges('[![NPM Version](https://img.shields.io/npm/v/vovk)](https://www.npmjs.com/package/vovk)'),
      ''
    );
  });

  test('preserves non-shield images', () => {
    assert.strictEqual(removeShieldBadges('![Photo](/photo.png)'), '![Photo](/photo.png)');
  });

  test('removes badge from table row', () => {
    const input = '| **`vovk`** | Runtime | [![NPM](https://img.shields.io/npm/v/vovk)](https://npmjs.com/vovk) |';
    const result = removeShieldBadges(input);
    assert.ok(!result.includes('shields.io'));
    assert.ok(result.includes('Runtime'));
  });
});

// --- Import stripping ---

describe('stripImportsOutsideCode', () => {
  test('strips doc-level imports', () => {
    const input = "import { Steps } from 'nextra/components';\n\n# Hello";
    assert.strictEqual(stripImportsOutsideCode(input), '\n\n# Hello');
  });

  test('preserves imports inside code blocks', () => {
    const input = "import Foo from './Foo';\n\n```ts\nimport Bar from './Bar';\n```";
    const result = stripImportsOutsideCode(input);
    assert.ok(!result.includes('import Foo'));
    assert.ok(result.includes("import Bar from './Bar';"));
  });

  test('preserves imports in multiple code blocks', () => {
    const input =
      "import X from 'x';\n\n```ts\nimport A from 'a';\nconsole.log(A);\n```\n\nimport Y from 'y';\n\n```ts\nimport B from 'b';\n```";
    const result = stripImportsOutsideCode(input);
    assert.ok(!result.includes('import X'));
    assert.ok(!result.includes('import Y'));
    assert.ok(result.includes("import A from 'a';"));
    assert.ok(result.includes("import B from 'b';"));
  });
});

// --- Link resolution ---

describe('resolveLinks', () => {
  test('resolves absolute path links', () => {
    assert.strictEqual(resolveLinks('[Quick Start](/quick-install)'), '[Quick Start](https://vovk.dev/quick-install)');
  });

  test('resolves absolute path with hash', () => {
    assert.strictEqual(resolveLinks('[meta](/req-vovk#meta)'), '[meta](https://vovk.dev/req-vovk#meta)');
  });

  test('resolves image paths', () => {
    assert.strictEqual(
      resolveLinks('![Screenshot](/screenshot.png)'),
      '![Screenshot](https://vovk.dev/screenshot.png)'
    );
  });

  test('does not touch external URLs', () => {
    assert.strictEqual(
      resolveLinks('[GitHub](https://github.com/finom/vovk)'),
      '[GitHub](https://github.com/finom/vovk)'
    );
  });

  test('does not touch relative paths (no leading slash)', () => {
    assert.strictEqual(resolveLinks('[file](./foo.ts)'), '[file](./foo.ts)');
  });

  test('handles multiple links in one line', () => {
    assert.strictEqual(resolveLinks('[A](/a) and [B](/b)'), '[A](https://vovk.dev/a) and [B](https://vovk.dev/b)');
  });
});

// --- Full pipeline ---

describe('transformContent (full pipeline)', () => {
  test('strips frontmatter', () => {
    assert.strictEqual(transformContent('---\ntitle: Test\n---\n\n# Hello'), '# Hello');
  });

  test('strips doc-level imports but preserves code block imports', () => {
    const input = "import { Steps } from 'nextra/components';\n\n```ts\nimport Foo from './Foo';\n```";
    const result = transformContent(input);
    assert.ok(!result.includes('import { Steps }'));
    assert.ok(result.includes("import Foo from './Foo';"));
  });

  test('converts IFrame to Link', () => {
    const result = transformContent('<IFrame src="https://example.com" width="100%" height="600px"></IFrame>');
    assert.strictEqual(result, 'Link: https://example.com');
  });

  test('converts Youtube to YouTube: link', () => {
    const result = transformContent('<Youtube src="https://www.youtube.com/embed/abc" className="mt-2" />');
    assert.strictEqual(result, 'YouTube: https://www.youtube.com/embed/abc');
  });

  test('removes components that should be deleted', () => {
    const result = transformContent('<CodeOrbit />\n<AppAlike />\n# Hello');
    assert.strictEqual(result, '# Hello');
  });

  test('unwraps Callout', () => {
    const result = transformContent('<Callout type="info" emoji="ℹ️">\nImportant note.\n</Callout>');
    assert.ok(result.includes('Important note.'));
    assert.ok(!result.includes('Callout'));
  });

  test('resolves links to full URLs', () => {
    const result = transformContent('See [procedure](/procedure) and [config](/config).');
    assert.ok(result.includes('https://vovk.dev/procedure'));
    assert.ok(result.includes('https://vovk.dev/config'));
  });

  test('full pipeline integration', () => {
    const input = `---
title: Test Page
---
import { FileTree } from 'nextra/components';

# My Page

<div className="wrapper">
  <img src="/screenshot.png" alt="Screenshot" />
</div>

<FileTree>
  <FileTree.Folder name="src" defaultOpen>
    <FileTree.File name="index.ts" />
  </FileTree.Folder>
</FileTree>

See [docs](/docs).

\`\`\`ts
import Something from './something';
\`\`\`

Some **markdown** text.`;

    const result = transformContent(input);
    assert.ok(!result.includes('---'));
    assert.ok(!result.includes('import { FileTree }'));
    assert.ok(result.includes("import Something from './something';"));
    assert.ok(result.includes('![Screenshot](https://vovk.dev/screenshot.png)'));
    assert.ok(result.includes('```\nsrc/\n  index.ts\n```'));
    assert.ok(result.includes('https://vovk.dev/docs'));
    assert.ok(result.includes('Some **markdown** text.'));
    assert.ok(!result.includes('<div'));
  });
});

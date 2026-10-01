import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getControllerClassNames } from '../../../dist/dev/index.mjs';

await describe('getControllerClassNames', async () => {
  await it('Finds the class of a file that imports an HTTP decorator from vovk', () => {
    const cases: Record<string, string> = {
      plain: `import { get, prefix } from 'vovk';\nexport default class UserController {}`,
      extends: `import { get, prefix } from 'vovk';\nexport default class UserController extends BaseController {}`,
      implements: `import { get } from 'vovk';\nexport default class UserController implements Foo {}`,
      'only @patch': `import { patch, prefix } from 'vovk';\nexport default class UserController {}`,
      'aliased import': `import { get as GET } from 'vovk';\nexport default class UserController {}`,
      generic: `import { get } from 'vovk';\nexport default class UserController<T extends { a: 1 }> {}`,
      'generic that extends': `import { post } from 'vovk';\nexport class UserController<T> extends Base<T> {}`,
    };

    for (const [name, code] of Object.entries(cases)) {
      assert.deepStrictEqual(getControllerClassNames(code), ['UserController'], name);
    }
  });

  await it('Skips a file without an HTTP decorator from vovk', () => {
    assert.deepStrictEqual(
      getControllerClassNames(`import type { VovkBody } from 'vovk';\nexport default class UserService {}`),
      []
    );
    assert.deepStrictEqual(getControllerClassNames(`import { get } from 'vovk';\nexport const handler = get();`), []);
  });
});

import assert from 'node:assert';
import { describe, it } from 'node:test';
import { addClassToSegmentCode } from '../../../dist/new/add-class-to-segment-code.mjs';
import { getSegmentRpcModuleNames } from '../../../dist/utils/get-segment-controllers.mjs';

const route = (body: string, importLine = "import { initSegment } from 'vovk';") => `${importLine}
import UserController from '../../modules/user/user-controller';
import PostController from '../../modules/post/post-controller';
${body}`;

await describe('getSegmentRpcModuleNames', async () => {
  await it('Reads the controllers variable passed as shorthand', () => {
    const code = route(`const controllers = { UserRPC: UserController, PostRPC: PostController };
export const { GET } = initSegment({ controllers });`);
    assert.deepStrictEqual(getSegmentRpcModuleNames(code), ['UserRPC', 'PostRPC']);
  });

  await it('Follows a variable of any name', () => {
    const code = route(`const ctrlrs = { UserRPC: UserController };
export const { GET } = initSegment({ emitSchema: true, controllers: ctrlrs });`);
    assert.deepStrictEqual(getSegmentRpcModuleNames(code), ['UserRPC']);
  });

  await it('Reads an object literal passed inline', () => {
    const code = route(`export const { GET } = initSegment({ controllers: { UserRPC: UserController } });`);
    assert.deepStrictEqual(getSegmentRpcModuleNames(code), ['UserRPC']);
  });

  await it('Finds initSegment imported under another name', () => {
    const code = route(
      `const list = { UserRPC: UserController };
export const { GET } = init({ controllers: list });`,
      "import { initSegment as init } from 'vovk';"
    );
    assert.deepStrictEqual(getSegmentRpcModuleNames(code), ['UserRPC']);
  });

  await it('Reads through as const and satisfies, quoted and shorthand keys', () => {
    const code = route(`const UserRPC = UserController;
const controllers = ({ UserRPC, 'PostRPC': PostController } as const) satisfies Record<string, unknown>;
export const { GET } = initSegment({ controllers });`);
    assert.deepStrictEqual(getSegmentRpcModuleNames(code), ['UserRPC', 'PostRPC']);
  });

  await it('Skips spreads and computed keys', () => {
    const code = route(`const more = { PostRPC: PostController };
const controllers = { UserRPC: UserController, ...more, ['Computed' + 'RPC']: PostController };
export const { GET } = initSegment({ controllers });`);
    assert.deepStrictEqual(getSegmentRpcModuleNames(code), ['UserRPC']);
  });

  await it('Returns nothing for controllers it cannot read without running the code', () => {
    const imported = `import { initSegment } from 'vovk';
import { controllers as list } from './controllers';
export const { GET } = initSegment({ controllers: list });`;
    const built = route(`const list: Record<string, unknown> = {};
for (const c of [UserController]) list[c.name] = c;
export const { GET } = initSegment({ controllers: list });`);
    assert.deepStrictEqual(getSegmentRpcModuleNames(imported), []);
    assert.deepStrictEqual(getSegmentRpcModuleNames(built), []);
    assert.deepStrictEqual(getSegmentRpcModuleNames('this is not { valid'), []);
  });
});

await describe('addClassToSegmentCode', async () => {
  await it('Adds the class to a controllers variable of any name', () => {
    const code = `import { initSegment } from 'vovk';

const ctrlrs = {};

export const { GET } = initSegment({ controllers: ctrlrs });
`;
    const result = addClassToSegmentCode(code, {
      sourceName: 'UserController',
      compiledName: 'UserRPC',
      importPath: '../../modules/user/user-controller',
    });
    assert.match(result, /const ctrlrs = \{\s*UserRPC: UserController,?\s*\}/);
    assert.match(result, /import UserController from '..\/..\/modules\/user\/user-controller'/);
  });
});

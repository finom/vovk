import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../../lib/getCLIAssertions.mts';
import updateConfigProperty from '../../lib/updateConfigProperty.mts';

await describe('CLI new controller and flags', async () => {
  const cwd = path.resolve(import.meta.dirname, '../../..');
  const dir = 'tmp_test_dir_new_controller_flags';
  const { runAtProjectDir, createNextApp, vovkInit, assertFile, assertNotExists } = getCLIAssertions({
    cwd,
    dir,
  });

  await it('New controller with --template', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir(
      '../dist/index.mjs new controller megaUser --template=../test/spec/new/custom-controller.ts.ejs'
    );

    await assertFile('src/modules/megaUser/MegaUserController.ts', `// hello megaUser`);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import MegaUserController from '../../../modules/megaUser/MegaUserController';`,
      `const controllers = {
        MegaUserRPC: MegaUserController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  await it('New controller with rootSegmentModulesDirName set at config', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await updateConfigProperty(path.join(cwd, dir, 'vovk.config.js'), ['rootSegmentModulesDirName'], 'myRoot');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller racoon');

    await assertFile('src/modules/myRoot/racoon/RacoonController.ts', `export default class RacoonController {`);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import RacoonController from '../../../modules/myRoot/racoon/RacoonController';`,
      `const controllers = {
        RacoonRPC: RacoonController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  await it('New controller with --dir', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller veryComplexEntity --out=custom-dir');

    await assertFile('custom-dir/VeryComplexEntityController.ts', [
      `export default class VeryComplexEntityController {`,
      `@get()
        static getVeryComplexEntities = (`,
      `static createVeryComplexEntity = `,
      `static updateVeryComplexEntity = `,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import VeryComplexEntityController from '../../../../custom-dir/VeryComplexEntityController';`,
      `const controllers = {
        VeryComplexEntityRPC: VeryComplexEntityController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  await it('New controller with --no-segment-update', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller coolRedChair --no-segment-update');

    await assertFile('src/modules/coolRedChair/CoolRedChairController.ts', [
      `export default class CoolRedChairController {`,
      `@get()
        static getCoolRedChairs = (`,
      `static createCoolRedChair = `,
      `static updateCoolRedChair = `,
    ]);
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `import CoolRedChairController from '../../../modules/coolRedChair/CoolRedChairController';`,
      `const controllers = {
        CoolRedChairRPC: CoolRedChairController,
      };`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
  });

  it('New controller with --dry-run', async () => {
    await createNextApp();
    await vovkInit('--yes --validation-library=none');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile('src/app/api/[[...vovk]]/route.ts', [
      `const controllers = {};`,
      `initSegment({
        emitSchema: true,
        controllers, 
      });`,
    ]);
    await runAtProjectDir('../dist/index.mjs new controller coolRedChair --dry-run');

    await assertFile(
      'src/app/api/[[...vovk]]/route.ts',
      `initSegment({
        emitSchema: true,
        controllers,
      });`
    );

    await assertNotExists('src/modules/coolRedChair/CoolRedChairController.ts');
  });
});

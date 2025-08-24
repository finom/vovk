import fs from 'fs/promises';
import getRelativeSrcRoot from '../getProjectInfo/getConfig/getRelativeSrcRoot.mjs';
import path from 'path';

function getCode(validationLibrary: 'arktype' | 'valibot') {
  if (validationLibrary === 'valibot') {
    return `
import { createStandardValidation, KnownAny } from 'vovk';
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const withValibot = createStandardValidation({
  toJSONSchema: (model: v.BaseSchema<KnownAny, KnownAny, KnownAny>) => toJsonSchema(model),
});

export default withValibot;
`.trimStart();
  }
  if (validationLibrary === 'arktype') {
    return `
import { createStandardValidation } from 'vovk';
import { type } from 'arktype';

const withArk = createStandardValidation({
  toJSONSchema: (model: type) => model.toJsonSchema(),
});

export default withArk;
`.trimStart();
  }
  throw new Error(`Unknown validation library: ${validationLibrary}`);
}

export async function createStandardSchemaValidatorFile({
  cwd,
  validationLibrary,
}: {
  cwd: string;
  validationLibrary: 'arktype' | 'valibot';
}) {
  const code = getCode(validationLibrary);
  const srcRoot = (await getRelativeSrcRoot({ cwd })) ?? '.';
  const libDir = path.join(cwd, srcRoot, 'lib');
  await fs.mkdir(libDir, { recursive: true });
  await fs.writeFile(path.join(libDir, `${validationLibrary === 'arktype' ? 'withArk' : 'withValibot'}.ts`), code);
}

import fs from 'fs/promises';
import path from 'path';
import getRelativeSrcRoot from '../getProjectInfo/getConfig/getRelativeSrcRoot.mjs';

function getCode(validationLibrary: 'arktype' | 'valibot') {
  if (validationLibrary === 'valibot') {
    return `
import { createStandardValidation } from 'vovk';
import { toJsonSchema } from '@valibot/to-json-schema';

const withValibot = createStandardValidation({
  toJSONSchema: (model) => toJsonSchema(model, {
    overrideSchema(context) {
      if (context.valibotSchema.type === 'file') {
        return { type: 'string', format: 'binary' };
      }
    },
  }),
});

export default withValibot;
`.trimStart();
  }
  if (validationLibrary === 'arktype') {
    return `
import { createStandardValidation } from 'vovk';
import type { type } from 'arktype';

const withArk = createStandardValidation({
  toJSONSchema: (model: type) => model.toJsonSchema({
    fallback: { 
      proto: (ctx) => ctx.proto === File ? {
        type: "string",
        format: "binary",
      } : ctx.base,
      default: (ctx) => ctx.base
    }
  })
});

export default withArk;
`.trimStart();
  }
  throw new Error(`Unknown validation library: ${validationLibrary}`);
}

export async function createStandardSchemaValidatorFile({
  root,
  validationLibrary,
}: {
  root: string;
  validationLibrary: 'arktype' | 'valibot';
}) {
  const code = getCode(validationLibrary);
  const srcRoot = (await getRelativeSrcRoot({ cwd: root })) ?? '.';

  const libDir = path.resolve(root, srcRoot, 'lib');

  const filePath = path.join(libDir, `${validationLibrary === 'arktype' ? 'withArk' : 'withValibot'}.ts`);
  await fs.mkdir(libDir, { recursive: true });
  await fs.writeFile(filePath, code);
}

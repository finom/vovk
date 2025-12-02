import fs from 'fs/promises';
import path from 'path';
import getRelativeSrcRoot from '../getProjectInfo/getConfig/getRelativeSrcRoot.mjs';

const CODE_BY_LIBRARY = {
  zod: `import { z } from 'zod/v4';
import { createStandardValidation } from 'vovk';

export const withZod = createStandardValidation({
  toJSONSchema: (model: z.core.$ZodType) => z.toJSONSchema(model),
});`,
  valibot: `import { createStandardValidation } from 'vovk';
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

export default withValibot;`,
  arktype: `import { createStandardValidation } from 'vovk';
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

export default withArk;`,
} satisfies Record<'arktype' | 'valibot' | 'zod', string>;

function getCode(validationLibrary: keyof typeof CODE_BY_LIBRARY) {
  const code = CODE_BY_LIBRARY[validationLibrary];
  if (!code) throw new Error(`Unknown validation library: ${validationLibrary}`);
  return code;
}

export async function createStandardSchemaValidatorFile({
  root,
  validationLibrary,
}: {
  root: string;
  validationLibrary: keyof typeof CODE_BY_LIBRARY;
}) {
  const code = getCode(validationLibrary);
  const srcRoot = (await getRelativeSrcRoot({ cwd: root })) ?? '.';

  const libDir = path.resolve(root, srcRoot, 'lib');

  const filenameByLibrary = {
    arktype: 'withArk.ts',
    valibot: 'withValibot.ts',
    zod: 'withZod.ts',
  } as const satisfies Record<keyof typeof CODE_BY_LIBRARY, string>;

  const filePath = path.join(libDir, filenameByLibrary[validationLibrary]);
  await fs.mkdir(libDir, { recursive: true });
  await fs.writeFile(filePath, code);
}

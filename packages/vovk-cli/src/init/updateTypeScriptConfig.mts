import path from 'node:path';
import fs from 'node:fs/promises';
import * as jsonc from 'jsonc-parser';
import prettify from '../utils/prettify.mjs';

export default async function updateTypeScriptConfig(
  root: string,
  compilerOptions: { experimentalDecorators?: true; emitDecoratorMetadata?: true }
) {
  const tsconfigPath = path.join(root, 'tsconfig.json');
  const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');

  let updatedContent = tsconfigContent;

  // Apply each compiler option
  for (const [key, value] of Object.entries(compilerOptions)) {
    const edits = jsonc.modify(updatedContent, ['compilerOptions', key], value, {
      formattingOptions: {},
    });
    updatedContent = jsonc.applyEdits(updatedContent, edits);
  }

  // Prettify the final content
  updatedContent = await prettify(updatedContent, tsconfigPath);

  await fs.writeFile(tsconfigPath, updatedContent, 'utf8');
}

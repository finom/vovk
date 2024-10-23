import path from 'path';
import fs from 'fs/promises';
import * as jsonc from 'jsonc-parser';

export default async function updateTypeScriptConfig(root: string) {
  const tsconfigPath = path.join(root, 'tsconfig.json');

  const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');

  // Use jsonc-parser to generate edits and modify the experimentalDecorators property
  const edits = jsonc.modify(tsconfigContent, ['compilerOptions', 'experimentalDecorators'], true, {
    formattingOptions: {},
  });

  // Apply the edits to the original content
  const updatedContent = jsonc.applyEdits(tsconfigContent, edits);

  await fs.writeFile(tsconfigPath, updatedContent, 'utf8');
}

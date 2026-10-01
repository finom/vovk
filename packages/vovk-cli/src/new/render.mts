import path from 'node:path';
import ejs from 'ejs';
import matter from 'gray-matter';
import _ from 'lodash';
import pluralize from 'pluralize';
import type { VovkStrictConfig } from 'vovk/internal';
import type { VovkModuleRenderResult } from '../types.mjs';
import { toPosixPath } from '../utils/to-import-path.mjs';
import { addCommonTerms } from './add-common-terms.mjs';

addCommonTerms();

export async function render(
  codeTemplate: string,
  {
    cwd,
    config,
    withService,
    segmentName,
    moduleName,
    empty,
    templateFileName,
    isNodeNextResolution,
    srcRoot,
  }: {
    cwd: string;
    config: VovkStrictConfig;
    withService: boolean;
    segmentName: string;
    moduleName: string;
    empty?: boolean;
    templateFileName: string;
    isNodeNextResolution: boolean;
    srcRoot: string | null;
  }
): Promise<VovkModuleRenderResult> {
  const defaultOutDir = [config.modulesDir, segmentName || config.rootSegmentModulesDirName, _.kebabCase(moduleName)]
    .filter(Boolean)
    .join('/');

  const relativePathToSourceRoot =
    toPosixPath(path.relative(path.resolve(cwd, defaultOutDir), path.join(cwd, srcRoot ?? '.'))) || '.';

  const theThing = _.camelCase(moduleName);
  const TheThing = _.upperFirst(theThing);

  // the templates build class and method names from it: "2fa" would give "class 2FaController"
  if (!/^[\p{ID_Start}$_][\p{ID_Continue}$\u200C\u200D]*$/u.test(TheThing)) {
    throw new Error(
      `Invalid module name "${moduleName}": the generated names would start with "${TheThing}", which isn't a valid identifier.`
    );
  }
  const the_thing = _.snakeCase(moduleName);
  const THE_THING = _.toUpper(the_thing);
  const the__thing = _.kebabCase(moduleName);

  const t = {
    // module name variations
    moduleName,
    theThing,
    theThings: pluralize(theThing),
    TheThing,
    TheThings: pluralize(TheThing),
    the_thing,
    the_things: pluralize(the_thing),
    THE_THING,
    THE_THINGS: pluralize(THE_THING),
    'the-thing': the__thing,
    'the-things': pluralize(the__thing),

    // data
    config,
    withService,
    segmentName,
    nodeNextResolutionExt: {
      ts: isNodeNextResolution ? '.ts' : '',
      js: isNodeNextResolution ? '.js' : '',
      cjs: isNodeNextResolution ? '.cjs' : '',
      mjs: isNodeNextResolution ? '.mjs' : '',
    },
    defaultOutDir,
    relativePathToSourceRoot,

    // libraries
    _, // lodash
    pluralize,
  };

  const parsed = matter((await ejs.render(codeTemplate, { t }, { async: true, filename: templateFileName })).trim());
  const { outDir, fileName, sourceName, compiledName } = parsed.data as VovkModuleRenderResult;
  const code = empty ? (sourceName ? `export default class ${sourceName} {}` : '') : parsed.content;

  return {
    outDir,
    fileName,
    sourceName,
    compiledName,
    code,
  };
}

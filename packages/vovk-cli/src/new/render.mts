import ejs from 'ejs';
import matter from 'gray-matter';
import _ from 'lodash';
import pluralize from 'pluralize';
import addCommonTerms from './addCommonTerms.mjs';
import type { VovkConfig, VovkModuleRenderResult } from '../types.mjs';

addCommonTerms();

export default async function render(
  codeTemplate: string,
  {
    config,
    withService,
    segmentName,
    moduleName,
  }: {
    cwd: string;
    config: VovkConfig;
    withService: boolean;
    segmentName: string;
    moduleName: string;
  }
): Promise<VovkModuleRenderResult> {
  const getModuleDirName = (givenSegmentName: string, givenModuleName: string) =>
    [config.modulesDir, givenSegmentName || config.rootSegmentModulesDirName, _.camelCase(givenModuleName)]
      .filter(Boolean)
      .join('/');

  const templateVars = {
    // input
    config,
    withService,
    segmentName,
    moduleName,

    // utils
    getModuleDirName,

    // libraries
    _, // lodash
    pluralize,
  };

  // first, render the front matter because it can use ejs variables
  const parsed = matter((await ejs.render(codeTemplate, templateVars, { async: true })).trim());
  const { dirName, fileName, sourceName, compiledName } = parsed.data as VovkModuleRenderResult;
  const code = parsed.content;

  // const templateContent = parsed.content; TODO

  // const code = await ejs.render(templateContent, templateVars, { async: true });

  return {
    dirName,
    fileName,
    sourceName,
    compiledName,
    code,
  };
}

import ejs from 'ejs';
import matter from 'gray-matter';
import _ from 'lodash';
import pluralize from 'pluralize';
import addCommonTerms from './addCommonTerms.mjs';
import type { VovkConfig } from '../types.mjs';

addCommonTerms();

export default async function render(
  codeTemplate: string,
  {
    config,
    withService,
    segmentName,
    moduleName,
  }: {
    config: VovkConfig;
    withService: boolean;
    segmentName: string;
    moduleName: string;
  }
) {
  const getModulePath = (givenSegmentName: string, givenModuleName: string, fileName?: string) =>
    [givenSegmentName || config.rootSegmentModulesDirName, _.camelCase(givenModuleName), fileName]
      .filter(Boolean)
      .join('/');

  const templateVars = {
    // input
    config,
    withService,
    segmentName,
    moduleName,

    // utils
    getModulePath,

    // libraries
    _, // lodash
    pluralize,
  };

  // first, render the front matter because it can use ejs variables
  const parsed = matter((await ejs.render(codeTemplate, templateVars, { async: true })).trim());
  const { filePath, sourceName, compiledName } = parsed.data as {
    filePath: string;
    sourceName: string;
    compiledName: string;
  };
  const templateContent = parsed.content;

  const code = await ejs.render(templateContent, templateVars, { async: true });

  return { filePath, sourceName, compiledName, code };
}

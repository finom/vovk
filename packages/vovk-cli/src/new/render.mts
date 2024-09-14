import ejs from 'ejs';
import matter from 'gray-matter';
import _ from 'lodash';
import pluralize from 'pluralize';
import addCommonTerms from './addCommonTerms';
import type { VovkConfig } from '../types.mjs';

addCommonTerms();

export default function render(
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
  const getFileDir = (givenSegmentName: string, givenModuleName: string) =>
    [_.camelCase(givenModuleName), givenSegmentName || config.rootSegmentModulesDirName].filter(Boolean).join('/') +
    '/';

  const templateVars = {
    // input
    config,
    withService,
    segmentName,
    moduleName,

    // utils
    getFileDir,

    // libraries
    _, // lodash
    pluralize,

    // custom YAML variables
  };

  const parsed = matter(ejs.render(codeTemplate, templateVars));
  const { fileName, className, rpcName } = parsed.data as {
    fileName: string;
    className: string;
    rpcName: string;
  };
  const templateContent = parsed.content;

  const code = ejs.render(templateContent, templateVars);

  return { fileName, className, rpcName, code };
}

import path from 'node:path';
import fs from 'node:fs/promises';
import render from './render.mjs';
import addClassToSegmentCode from './addClassToSegmentCode.mjs';
import getProjectInfo from '../getProjectInfo/index.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';
import prettify from '../utils/prettify.mjs';
import resolveAbsoluteModulePath from '../utils/resolveAbsoluteModulePath.mjs';
import locateSegments from '../locateSegments.mjs';

function splitByLast(str: string, delimiter: string = '/'): [string, string] {
  const index = str.lastIndexOf(delimiter);

  if (index === -1) {
    // Delimiter not found; return empty string and the original string
    return ['', str];
  }

  const before = str.substring(0, index);
  const after = str.substring(index + delimiter.length);

  return [before, after];
}

export default async function newModule({
  what,
  moduleNameWithOptionalSegment,
  dryRun,
  dir: dirFlag,
  templates: templatesFlag,
  noSegmentUpdate,
  overwrite,
  empty,
}: {
  what: string[];
  moduleNameWithOptionalSegment: string;
  dryRun?: boolean;
  dir?: string;
  templates?: string[];
  noSegmentUpdate?: boolean;
  overwrite?: boolean;
  empty?: boolean;
}) {
  const { config, log, cwd, apiDir } = await getProjectInfo();
  const segments = await locateSegments({ dir: path.join(cwd, apiDir), config, log });
  let templates = config.moduleTemplates as Required<typeof config.moduleTemplates>;
  const [segmentName, moduleName] = splitByLast(moduleNameWithOptionalSegment);
  // replace c by controller, s by service, everything else keeps the same
  what = what.map((s) => {
    switch (s) {
      case 'c':
        return 'controller';
      case 's':
        return 'service';
      default:
        return s;
    }
  });

  if (templatesFlag) {
    if (templatesFlag.length > what.length) {
      throw new Error('Too many templates provided');
    }
    templates = templatesFlag.reduce(
      (acc, templatePath, index) => ({
        ...acc,
        [what[index]]: templatePath,
      }),
      templates
    );
  }

  for (const type of what) {
    if (!templates[type]) {
      throw new Error(`Template for "${type}" not found`);
    }
  }

  const segment = segments.find((s) => s.segmentName === segmentName);

  if (!segment) {
    throw new Error(
      `Unable to create module. Segment "${segmentName}" not found. Run "vovk new segment ${segmentName}" to create it`
    );
  }

  for (const type of what) {
    const templatePath = templates[type]!;
    const templateAbsolutePath = resolveAbsoluteModulePath(templatePath, cwd);
    const templateCode = await fs.readFile(templateAbsolutePath, 'utf-8');

    const {
      dir: renderedDir,
      fileName,
      sourceName,
      compiledName,
      code,
    } = await render(templateCode, {
      cwd,
      config,
      withService: what.includes('service'),
      segmentName,
      moduleName,
      empty,
      templateFileName: templateAbsolutePath,
    });
    const dir = dirFlag || renderedDir;
    if (!dir) {
      throw new Error(`The template for "${type}" does not provide a dir`);
    }

    if (!fileName) {
      throw new Error(`The template for "${type}" does not provide a fileName`);
    }

    const absoluteModuleDir = path.join(cwd, dir);
    const absoluteModulePath = path.join(absoluteModuleDir, fileName);

    const prettiedCode = await prettify(code, absoluteModulePath);

    if (!dryRun) {
      if (!overwrite && (await getFileSystemEntryType(absoluteModulePath))) {
        log.warn(`File ${chalkHighlightThing(absoluteModulePath)} already exists, skipping this "${type}"`);
      } else {
        await fs.mkdir(absoluteModuleDir, { recursive: true });
        await fs.writeFile(absoluteModulePath, prettiedCode);
        log.info(
          `Created ${chalkHighlightThing(fileName)} using ${chalkHighlightThing(`"${type}"`)} template for ${formatLoggedSegmentName(segmentName)}`
        );
      }
    }

    if (type === 'controller') {
      if (!sourceName) {
        throw new Error(`The template for "${type}" does not provide a sourceName`);
      }

      if (!compiledName) {
        throw new Error(`The template for "${type}" does not provide a compiledName`);
      }

      const { routeFilePath } = segment;
      const segmentSourceCode = await fs.readFile(routeFilePath, 'utf-8');
      const importPath = path
        .relative(path.dirname(routeFilePath) + '/', absoluteModulePath)
        .replace(/\.(ts|tsx)$/, '');

      if (!noSegmentUpdate) {
        const newSegmentCode = await prettify(
          addClassToSegmentCode(segmentSourceCode, {
            sourceName,
            compiledName,
            importPath,
          }),
          routeFilePath
        );
        if (!dryRun) {
          await fs.writeFile(routeFilePath, newSegmentCode);
        }
      }

      log.info(
        `Added${empty ? ' empty' : ''} ${chalkHighlightThing(sourceName)} ${type} as ${chalkHighlightThing(compiledName)} to ${formatLoggedSegmentName(segmentName)}`
      );
    }
  }
}

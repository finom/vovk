import path from 'path';
import fs from 'fs/promises';
import getProjectInfo from '../getProjectInfo/index.mjs';
import render from './render.mjs';
import chalkHighlightThing from '../utils/chalkHighlightThing.mjs';
import formatLoggedSegmentName from '../utils/formatLoggedSegmentName.mjs';
import locateSegments from '../locateSegments.mjs';
import addClassToSegmentCode from './addClassToSegmentCode.mjs';
import getFileSystemEntryType from '../utils/getFileSystemEntryType.mjs';
import prettify from '../utils/prettify.mjs';

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
  dir: dirNameFlag,
  templates: templatesFlag,
  noSegmentUpdate,
  overwrite,
}: {
  what: string[];
  moduleNameWithOptionalSegment: string;
  dryRun?: boolean;
  dir?: string;
  templates?: string[];
  noSegmentUpdate?: boolean;
  overwrite?: boolean;
}) {
  const { config, log, apiDir, cwd } = await getProjectInfo();
  let templates = config.templates as Required<typeof config.templates>;
  const [segmentName, moduleName] = splitByLast(moduleNameWithOptionalSegment);
  // replace c by controller, s by service, w by worker, everything else keeps the same
  what = what.map((s) => {
    switch (s) {
      case 'c':
        return 'controller';
      case 's':
        return 'service';
      case 'w':
        return 'worker';
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

  const segments = await locateSegments(apiDir);
  const segment = segments.find((s) => s.segmentName === segmentName);

  if (!segment) {
    throw new Error(
      `Unable to create module. Segment "${segmentName}" not found. Run "vovk new segment ${segmentName}" to create it`
    );
  }

  for (const type of what) {
    const templatePath = templates[type]!;
    const templateAbsolutePath =
      templatePath.startsWith('/') || templatePath.startsWith('.')
        ? path.resolve(cwd, templatePath)
        : path.resolve(cwd, './node_modules', templatePath);
    const templateCode = await fs.readFile(templateAbsolutePath, 'utf-8');
    const {
      dirName: renderedDirName,
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
    });
    const dirName = dirNameFlag || renderedDirName;
    if (!dirName) {
      throw new Error(`The template for "${type}" does not provide a dirName`);
    }

    if (!fileName) {
      throw new Error(`The template for "${type}" does not provide a fileName`);
    }

    const absoluteModuleDir = path.join(cwd, dirName);
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

    if (type === 'controller' || type === 'worker') {
      if (!sourceName) {
        throw new Error(`The template for "${type}" does not provide a sourceName`);
      }

      if (!compiledName) {
        throw new Error('The template for "${type}" does not provide a compiledName');
      }

      const { routeFilePath } = segment;
      const segmentSourceCode = await fs.readFile(routeFilePath, 'utf-8');
      const importPath = path.relative(path.dirname(routeFilePath), absoluteModulePath).replace(/\.(ts|tsx)$/, '');

      if (!noSegmentUpdate) {
        const newSegmentCode = await prettify(
          addClassToSegmentCode(segmentSourceCode, {
            sourceName,
            compiledName,
            type,
            importPath,
          }),
          routeFilePath
        );
        if (!dryRun) {
          await fs.writeFile(routeFilePath, newSegmentCode);
        }
      }

      log.info(
        `Added ${chalkHighlightThing(sourceName)} ${type} as ${chalkHighlightThing(compiledName)} to ${formatLoggedSegmentName(segmentName)}`
      );
    }
  }
}

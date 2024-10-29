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
  dirName: dirNameFlag,
  template: templateFlag,
  noSegmentUpdate,
  overwrite,
}: {
  what: string[];
  moduleNameWithOptionalSegment: string;
  dryRun?: boolean;
  dirName?: string;
  template?: string;
  noSegmentUpdate?: boolean;
  overwrite?: boolean;
}) {
  const { config, log, apiDir, cwd } = await getProjectInfo();
  const templates = config.templates as Required<typeof config.templates>;
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

  // check if template exists
  for (const type of what) {
    if (!templates[type]) {
      throw new Error(`Template for ${type} not found in config`);
    }
  }

  const segments = await locateSegments(apiDir);
  const segment = segments.find((s) => s.segmentName === segmentName);

  if (!segment) {
    throw new Error(`Segment ${segmentName} not found`);
  }

  for (const type of what) {
    const templatePath = templateFlag ?? templates[type]!;
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

    const absoluteModuleDir = path.join(cwd, dirNameFlag || renderedDirName);
    const absoluteModulePath = path.join(absoluteModuleDir, fileName);

    const prettiedCode = await prettify(code, absoluteModulePath);

    if (!dryRun) {
      if (!overwrite && (await getFileSystemEntryType(absoluteModulePath))) {
        log.warn(`File ${chalkHighlightThing(absoluteModulePath)} already exists, skipping this "${type}"`);
      } else {
        await fs.mkdir(absoluteModuleDir, { recursive: true });
        await fs.writeFile(absoluteModulePath, prettiedCode);
      }
    }

    if (type === 'controller' || type === 'worker') {
      if (!sourceName) {
        throw new Error('sourceName is required');
      }
      if (!compiledName) {
        throw new Error('compiledName is required');
      }

      const { routeFilePath } = segment;
      const segmentSourceCode = await fs.readFile(routeFilePath, 'utf-8');
      const importPath = path.relative(path.dirname(routeFilePath), absoluteModulePath).replace(/\.(ts|tsx)$/, '');

      if (!noSegmentUpdate) {
        const newSegmentCode = addClassToSegmentCode(segmentSourceCode, {
          sourceName,
          compiledName,
          type,
          importPath,
        });
        if (!dryRun) {
          await fs.writeFile(routeFilePath, newSegmentCode);
        }
      }

      log.info(
        `Added ${chalkHighlightThing(sourceName)} ${type} to ${formatLoggedSegmentName(segmentName)} as ${chalkHighlightThing(compiledName)}`
      );
    }

    log.info(
      `Created ${chalkHighlightThing(fileName)} using "${chalkHighlightThing(type)}" template for ${formatLoggedSegmentName(segmentName)}`
    );
  }
}

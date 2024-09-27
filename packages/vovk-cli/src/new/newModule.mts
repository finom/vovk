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
}: {
  what: string[];
  moduleNameWithOptionalSegment: string;
  dryRun: boolean;
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
    const templatePath = templates[type]!;
    const templateAbsolutePath =
      templatePath.startsWith('/') || templatePath.startsWith('.')
        ? path.resolve(cwd, templatePath)
        : path.resolve(cwd, './node_modules', templatePath);
    const templateCode = await fs.readFile(templateAbsolutePath, 'utf-8');
    const { fileName, className, rpcName, code } = await render(templateCode, {
      config,
      withService: what.includes('service'),
      segmentName,
      moduleName,
    });

    const absoluteModulePath = path.join(cwd, config.modulesDir, fileName);

    const dirName = path.dirname(absoluteModulePath);
    const prettiedCode = await prettify(code, absoluteModulePath);

    if (!dryRun) {
      if (await getFileSystemEntryType(absoluteModulePath)) {
        log.warn(`File ${chalkHighlightThing(absoluteModulePath)} already exists, skipping this "${type}"`);
      } else {
        await fs.mkdir(dirName, { recursive: true });
        await fs.writeFile(absoluteModulePath, prettiedCode);
      }
    }

    if (type === 'controller' || type === 'worker') {
      const { routeFilePath } = segment;

      const segmentSourceCode = await fs.readFile(routeFilePath, 'utf-8');
      const importPath = path.relative(dirName, absoluteModulePath).replace(/\.(ts|tsx)$/, '');
      const newSegmentCode = addClassToSegmentCode(segmentSourceCode, {
        className,
        rpcName,
        type,
        importPath,
      });
      if (!dryRun) {
        await fs.writeFile(routeFilePath, newSegmentCode);
      }

      log.info(
        `Added ${chalkHighlightThing(className)} ${type} to ${formatLoggedSegmentName(segmentName)} as ${chalkHighlightThing(rpcName)}`
      );
    }

    log.info(
      `Created ${chalkHighlightThing(fileName)} with ${chalkHighlightThing(type)} template for ${formatLoggedSegmentName(segmentName)}`
    );
  }
}